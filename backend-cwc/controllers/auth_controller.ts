import { Express, Request, Response, NextFunction ,RequestHandler  } from "express";
import User, { IUser } from "../models/user_model";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { Document } from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { OAuth2Client } from 'google-auth-library';

import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>  => {
  try {
    const { token } = req.body; 
    if (!token) {
       res.status(400).json({ message: "No token provided" });
        return;
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
       res.status(401).json({ message: "Invalid Google token" });
        return;
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        name: payload.name, 
        password: "",
        isGoogleUser: true,  
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    if (!Array.isArray(user.refreshToken)) {
      user.refreshToken = [];
    }
    user.refreshToken.push(refreshToken);
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken,
      id: user._id,
    });
  } catch (error) {
    console.error("Error in googleLogin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const register = async (req: Request, res: Response) => {
  try {
    const {name , email, password, location, bio, favorite_coffee } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      location,
      bio,
      favorite_coffee,
    });
    if (!user) {
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    res.status(201).json({ success: true, id: user._id });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

type tokens = {
  accessToken: string;
  refreshToken: string;
};

const generateTokens = (userId: string): tokens => {
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("Token secrets not found");
  }
  const accessExpires = Number(process.env.ACCESS_TOKEN_EXPIRES) || 86400; 
  const refreshExpires = Number(process.env.REFRESH_TOKEN_EXPIRES) || 604800; 
  
  const random = Math.random().toString();

  const optionsAccess: SignOptions = { expiresIn: accessExpires };
  const accessToken = jwt.sign(
    { _id: userId, random },
    process.env.ACCESS_TOKEN_SECRET!,
    optionsAccess
  );

  const optionsRefresh: SignOptions = { expiresIn: refreshExpires };
  const refreshToken = jwt.sign(
    { _id: userId, random },
    process.env.REFRESH_TOKEN_SECRET!,
    optionsRefresh
  );

  return { accessToken, refreshToken };
};


const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    if (!Array.isArray(user.refreshToken)) {
      user.refreshToken = [];
    }
    user.refreshToken.push(refreshToken); 
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, accessToken, id: user._id });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

type tUser = Document & {
  _id: string;
  email: string;
  password: string;
  bio?: string;
  favorite_coffee?: string;
  location?: string;
  joined_date?: Date;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  refreshToken?: string[];
  name?: string;
};

const verifyRefreshToken = (
  refreshToken: string | undefined,
  removeUsedToken: boolean = true
): Promise<tUser> => {
  return new Promise<tUser>(async (resolve, reject) => {
    if (!refreshToken) {
      reject("No refresh token provided");
      return;
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
      reject("Missing refresh token secret");
      return;
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err: any, payload: any) => {
        if (err || !payload || !payload._id) {
          reject("Invalid refresh token");
          return;
        }

        const userId = payload._id;

        try {
          const user = await User.findById(userId);
          if (!user) {
            reject("User not found");
            return;
          }

          if (!user.refreshToken || !Array.isArray(user.refreshToken)) {
            user.refreshToken = [];
          }

          if (!user.refreshToken.includes(refreshToken)) {
            reject("Refresh token not found in user records");
            return;
          }

          // Only remove token if required by the flow.
          if (removeUsedToken) {
            user.refreshToken = user.refreshToken.filter(
              (token) => token !== refreshToken
            );
            await user.save();
          }

          resolve(user as unknown as tUser);
        } catch (err) {
          reject("Server error while verifying refresh token");
        }
      }
    );
  });
};
const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
    });

    const googleToken = req.body.googleToken;
    if (googleToken) {
      try {
        const revokeResponse = await fetch(
          `https://oauth2.googleapis.com/revoke?token=${googleToken}`,
          {
            method: "POST",
            headers: { "Content-type": "application/x-www-form-urlencoded" },
          }
        );
        if (!revokeResponse.ok) {
          console.warn("Google token revoke failed:", revokeResponse.statusText);
        }
      } catch (revokeError) {
        console.error("Error revoking Google token:", revokeError);
      }
    }

    let userId = req.user?._id;
    if (!userId && refreshToken) {
      try {
        const payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        ) as jwt.JwtPayload;
        userId = payload?._id;
      } catch (err) {
        console.error("Error verifying refresh token during logout", err);
      }
    }

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.refreshToken = user.refreshToken?.filter(
          (token: string) => token !== refreshToken
        ) || [];
        await user.save();
      }
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout failed", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as jwt.JwtPayload;

    if (!decoded || !decoded._id) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("🔥 Error in getUser:", error); 
    res.status(500).json({ message: "Internal server error" });
  }
};


const chatController =  async (req: Request, res: Response): Promise<void> => {
    try {
      const userMessage = req.body.message;
      if (!userMessage) {
         res.status(400).json({ message: "Message is required" });
          return;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are a coffee expert chatbot in the "Smart Coffee" application. You must answer in English in a correct and clear manner, in short and concise answers, without using asterisks or special formatting symbols.
If the user asks a question about coffee – provide a professional and detailed answer.
If the user asks about the location of nearby coffee shops or recommended coffee shops, provide relevant recommendations (according to general information or general estimation) and elaborate on the type of coffee or the atmosphere of the place, as far as you know.
If the user greets you (for example, "Hello", "How are you", "Hey", "I need help", etc.), respond in a friendly manner in proper Hebrew, even if it is not about coffee.
If the user requests text for social media posts or marketing content, adapt your answer to an interesting and catchy post style, making sure it's short and rhythmic, rather than an in-depth entry like Wikipedia.
If the user asks a question that is not related to coffee topics at all and does not constitute a greeting or a request for help – politely say: "I am mainly here to talk about coffee, but I'll be happy to help if there is something general."
Now answer the user's message: ${userMessage}`;
            const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log("Generated response:", text);
      console.log("Response", result.response);

      res.status(200).json({ response: text });
    } catch (error) {
      console.error("Error generating response:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Cookies received:", req.cookies);

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      console.log("No refresh token found in cookies");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    console.log("Received refresh token:", refreshToken);

    const user = await verifyRefreshToken(refreshToken);
    if (!user) {
      console.log("Invalid refresh token");
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id.toString()
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("New refresh token set in cookie");

    res.status(200).json({ success: true, accessToken, id: user._id });
  } catch (error) {
    console.error("Error in refresh route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

type Payload = {
  _id: string;
};

declare module "express" {
  export interface Request {
    user?: {
      _id: string;
    };
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization && authorization.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Access Denied: Token missing" });
      return;
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      res
        .status(500)
        .json({ message: "Server error: Token secret is missing" });
      return;
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        res.status(401).json({ message: "Access Denied: Invalid token" });
        return;
      }

      req.user = payload as Payload;
      next();
    });
  } catch (error) {
    console.error("Authentication Middleware Error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getNameByid = async (req: Request, res: Response) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
      }
      res.status(200).json({ username: user.name });
      return;
  } catch (error) {
          res.status(500).json({ message: "Internal server error" });
          return;
      }
}
export const handleGenerateTokens: RequestHandler = (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res
        .status(400)
        .json({ success: false, message: "userId is required" });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(userId);
    res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (error: any) {
    console.error("Error in handleGenerateTokens:", error);
    if (error.message === "Token secrets not found") {
      res
        .status(500)
        .json({ success: false, message: "Token secrets not found" });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};


export const handleVerifyRefreshToken: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    // Do not remove token when simply verifying it
    const user = await verifyRefreshToken(refreshToken, false);
    res.status(200).json({
      success: true,
      userId: user._id,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Error in handleVerifyRefreshToken:", error);
    if (typeof error === "string") {
      res.status(400).json({ success: false, message: error });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const authControllers = {
  register,
  login,
  logout,
  refresh,
  getUser,
  chatController,
  getNameByid,
  googleLogin,
  verifyRefreshToken,
  generateTokens,
  handleGenerateTokens,
  handleVerifyRefreshToken,
};

export default authControllers;
