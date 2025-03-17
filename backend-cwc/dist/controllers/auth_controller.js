"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVerifyRefreshToken = exports.handleGenerateTokens = exports.authMiddleware = void 0;
const user_model_1 = __importDefault(require("../models/user_model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generative_ai_1 = require("@google/generative-ai");
const google_auth_library_1 = require("google-auth-library");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const googleLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ message: "No token provided" });
            return;
        }
        const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = yield client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(401).json({ message: "Invalid Google token" });
            return;
        }
        let user = yield user_model_1.default.findOne({ email: payload.email });
        if (!user) {
            user = yield user_model_1.default.create({
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
        yield user.save();
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
    }
    catch (error) {
        console.error("Error in googleLogin:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, location, bio, favorite_coffee } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: "Email already registered" });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield user_model_1.default.create({
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
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const generateTokens = (userId) => {
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
        throw new Error("Token secrets not found");
    }
    const accessExpires = Number(process.env.ACCESS_TOKEN_EXPIRES) || 86400;
    const refreshExpires = Number(process.env.REFRESH_TOKEN_EXPIRES) || 604800;
    const random = Math.random().toString();
    const optionsAccess = { expiresIn: accessExpires };
    const accessToken = jsonwebtoken_1.default.sign({ _id: userId, random }, process.env.ACCESS_TOKEN_SECRET, optionsAccess);
    const optionsRefresh = { expiresIn: refreshExpires };
    const refreshToken = jsonwebtoken_1.default.sign({ _id: userId, random }, process.env.REFRESH_TOKEN_SECRET, optionsRefresh);
    return { accessToken, refreshToken };
};
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        if (!Array.isArray(user.refreshToken)) {
            user.refreshToken = [];
        }
        user.refreshToken.push(refreshToken);
        yield user.save();
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ success: true, accessToken, id: user._id });
    }
    catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const verifyRefreshToken = (refreshToken, removeUsedToken = true) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        if (!refreshToken) {
            reject("No refresh token provided");
            return;
        }
        if (!process.env.REFRESH_TOKEN_SECRET) {
            reject("Missing refresh token secret");
            return;
        }
        jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (err || !payload || !payload._id) {
                reject("Invalid refresh token");
                return;
            }
            const userId = payload._id;
            try {
                const user = yield user_model_1.default.findById(userId);
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
                    user.refreshToken = user.refreshToken.filter((token) => token !== refreshToken);
                    yield user.save();
                }
                resolve(user);
            }
            catch (err) {
                reject("Server error while verifying refresh token");
            }
        }));
    }));
};
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
                const revokeResponse = yield fetch(`https://oauth2.googleapis.com/revoke?token=${googleToken}`, {
                    method: "POST",
                    headers: { "Content-type": "application/x-www-form-urlencoded" },
                });
                if (!revokeResponse.ok) {
                    console.warn("Google token revoke failed:", revokeResponse.statusText);
                }
            }
            catch (revokeError) {
                console.error("Error revoking Google token:", revokeError);
            }
        }
        let userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId && refreshToken) {
            try {
                const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                userId = payload === null || payload === void 0 ? void 0 : payload._id;
            }
            catch (err) {
                console.error("Error verifying refresh token during logout", err);
            }
        }
        if (userId) {
            const user = yield user_model_1.default.findById(userId);
            if (user) {
                user.refreshToken = ((_b = user.refreshToken) === null || _b === void 0 ? void 0 : _b.filter((token) => token !== refreshToken)) || [];
                yield user.save();
            }
        }
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout failed", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded || !decoded._id) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        const user = yield user_model_1.default.findById(decoded._id).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("🔥 Error in getUser:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const chatController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            res.status(400).json({ message: "Message is required" });
            return;
        }
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `אתה צ'אטבוט מומחה לקפה באפליקציית "קפה חכמה". עליך לענות בשפה העברית בצורה תקינה וברורה, בתשובות קצרות וענייניות, וללא שימוש בכוכביות או סימני עיצוב מיוחדים.
אם המשתמש שואל שאלה על קפה – ספק תשובה מקצועית ומפורטת. 
אם המשתמש שואל על מיקום של בתי קפה קרובים או בתי קפה מומלצים, ספק המלצות רלוונטיות (לפי מידע כללי או הערכה כללית) והרחב בהמלצות על סוג הקפה או אווירת המקום, ככל הידוע לך.
אם המשתמש מברך אותך (כמו "שלום", "מה שלומך", "היי", "אני צריך עזרה" וכדומה) – הגֵב באופן ידידותי בעברית תקינה, גם אם לא מדובר בקפה.
אם המשתמש מבקש טקסט לפוסטים ברשתות חברתיות או תוכן שיווקי, התאם את התשובה שלך לאופי פוסט מעניין וקולע, תוך הקפדה על סגנון קצר וקצבי, ולא מידע ארוך ומעמיק כמו ערך ויקיפדיה.
אם המשתמש שואל שאלה שאינה קשורה כלל לנושאי קפה כולל ואינה בגדר ברכה או בקשת עזרה – אמור לו בנימוס: "אני כאן בעיקר כדי לדבר על קפה, אבל אשמח לעזור אם יש משהו כללי."

כעת ענה על הודעת המשתמש הבאה: ${userMessage}`;
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const text = response.text();
        console.log("Generated response:", text);
        console.log("Response", result.response);
        res.status(200).json({ response: text });
    }
    catch (error) {
        console.error("Error generating response:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Cookies received:", req.cookies);
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            console.log("No refresh token found in cookies");
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        console.log("Received refresh token:", refreshToken);
        const user = yield verifyRefreshToken(refreshToken);
        if (!user) {
            console.log("Invalid refresh token");
            res.status(401).json({ message: "Invalid refresh token" });
            return;
        }
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/api/auth/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        console.log("New refresh token set in cookie");
        res.status(200).json({ success: true, accessToken, id: user._id });
    }
    catch (error) {
        console.error("Error in refresh route:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const authMiddleware = (req, res, next) => {
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
        jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                res.status(401).json({ message: "Access Denied: Invalid token" });
                return;
            }
            req.user = payload;
            next();
        });
    }
    catch (error) {
        console.error("Authentication Middleware Error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.authMiddleware = authMiddleware;
const getNameByid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ username: user.name });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
const handleGenerateTokens = (req, res, next) => {
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
    }
    catch (error) {
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
exports.handleGenerateTokens = handleGenerateTokens;
const handleVerifyRefreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        // Do not remove token when simply verifying it
        const user = yield verifyRefreshToken(refreshToken, false);
        res.status(200).json({
            success: true,
            userId: user._id,
            email: user.email,
        });
    }
    catch (error) {
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
});
exports.handleVerifyRefreshToken = handleVerifyRefreshToken;
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
    handleGenerateTokens: exports.handleGenerateTokens,
    handleVerifyRefreshToken: exports.handleVerifyRefreshToken,
};
exports.default = authControllers;
