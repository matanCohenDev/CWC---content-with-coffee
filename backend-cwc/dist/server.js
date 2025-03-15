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
exports.connectDB = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth_routes"));
const post_routes_1 = __importDefault(require("./routes/post_routes"));
const comment_routes_1 = __importDefault(require("./routes/comment_routes"));
const like_routes_1 = __importDefault(require("./routes/like_routes"));
const message_routes_1 = __importDefault(require("./routes/message_routes"));
const user_routes_1 = __importDefault(require("./routes/user_routes"));
const follow_routes_1 = __importDefault(require("./routes/follow_routes"));
dotenv_1.default.config();
const BASE_URL = process.env.BASE_URL;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: BASE_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('public'));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/post', post_routes_1.default);
app.use('/api/comment', comment_routes_1.default);
app.use('/api/like', like_routes_1.default);
app.use('/api/message', message_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api/follow', follow_routes_1.default);
path_1.default.join(__dirname, "public");
// הגדרת תיקיית העלאת פוסטים
const postsUploadDir = path_1.default.join(__dirname, "uploads/posts");
if (!fs_1.default.existsSync(postsUploadDir)) {
    fs_1.default.mkdirSync(postsUploadDir, { recursive: true });
}
const postsStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, postsUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    },
});
const uploadPosts = (0, multer_1.default)({ storage: postsStorage });
app.post("/upload/post", uploadPosts.single("image"), (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        const imageUrl = `/uploads/posts/${req.file.filename}`;
        res.json({ success: true, imageUrl });
    }
    catch (error) {
        console.error("Error uploading post:", error);
        res.status(500).json({ message: "Failed to upload post" });
    }
});
// הגדרת תיקיית העלאת תמונות פרופיל
const profilePicsDir = path_1.default.join(__dirname, "uploads/profile-pics");
if (!fs_1.default.existsSync(profilePicsDir)) {
    fs_1.default.mkdirSync(profilePicsDir, { recursive: true });
}
const profilePicStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profilePicsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    },
});
const uploadProfilePic = (0, multer_1.default)({ storage: profilePicStorage });
app.post("/upload/profile-pics", uploadProfilePic.single("image"), (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        const imageUrl = `/uploads/profile-pics/${req.file.filename}`;
        res.json({ success: true, imageUrl });
    }
    catch (error) {
        console.error("Error uploading profile picture:", error);
        res.status(500).json({ message: "Failed to upload profile picture" });
    }
});
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Auth API",
            version: "1.0.0",
            description: "User authentication API"
        },
        servers: [{ url: "http://localhost:3000" }]
    },
    apis: ["./routes/*.ts"]
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
exports.default = app;
