import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import cookieParser from "cookie-parser";
import AuthRoutes from './routes/auth_routes';
import PostRoutes from './routes/post_routes';
import CommentRoutes from './routes/comment_routes';
import LikeRoutes from './routes/like_routes';
import MessagesRoutes from './routes/message_routes';
import UserRoutes from './routes/user_routes';
import FollowRoutes from './routes/follow_routes';

dotenv.config();
const BASE_URL = process.env.BASE_URL;

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const app = express();
app.use(cors({
  origin: BASE_URL,
  credentials: true, 
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use('/api/auth', AuthRoutes);
app.use('/api/post', PostRoutes);
app.use('/api/comment', CommentRoutes);
app.use('/api/like', LikeRoutes);
app.use('/api/message', MessagesRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/follow', FollowRoutes);

path.join(__dirname, "public");

// הגדרת תיקיית העלאת פוסטים
const postsUploadDir = path.join(__dirname , "uploads/posts");
if (!fs.existsSync(postsUploadDir)) {
  fs.mkdirSync(postsUploadDir, { recursive: true });
}

const postsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postsUploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const uploadPosts = multer({ storage: postsStorage });

app.post("/upload/post", uploadPosts.single("image"), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const imageUrl = `/uploads/posts/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error uploading post:", error);
    res.status(500).json({ message: "Failed to upload post" });
  }
});

// הגדרת תיקיית העלאת תמונות פרופיל
const profilePicsDir = path.join(__dirname, "uploads/profile-pics");
if (!fs.existsSync(profilePicsDir)) {
  fs.mkdirSync(profilePicsDir, { recursive: true });
}

const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilePicsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const uploadProfilePic = multer({ storage: profilePicStorage });

app.post("/upload/profile-pics", uploadProfilePic.single("image"), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const imageUrl = `/uploads/profile-pics/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Failed to upload profile picture" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const swaggerOptions = {
  definition: {
      openapi: "3.0.0",
      info: {
          title: "Auth API",
          version: "1.0.0",
          description: "User authentication API"
      },
      servers: [{ url: process.env.BASE_URL }]
  },
  apis: ["./routes/*.ts"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

export default app;
