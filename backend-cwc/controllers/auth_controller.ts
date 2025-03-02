import { Express, Request, Response, NextFunction } from "express";
import User, { UserInterface } from "../models/user_model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, location, bio, favorite_coffee } = req.body;
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
  const random = Math.random().toString();
  const accessToken = jwt.sign(
    { _id: userId, random },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { _id: userId, random },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
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
  refreshToken: string | undefined
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

          user.refreshToken = user.refreshToken.filter(
            (token) => token !== refreshToken
          );
          await user.save();

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
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    user.refreshToken = user.refreshToken?.filter((token) => token !== refreshToken) || [];
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
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
      // שים לב שצריך _id ולא id
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
    console.error("🔥 Error in getUser:", error); // ✅ נוסיף לוג לשגיאה
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

const authControllers = {
  register,
  login,
  logout,
  refresh,
  getUser,
};

export default authControllers;
