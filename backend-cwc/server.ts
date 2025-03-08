import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cookieParser from "cookie-parser";
import AuthRoutes from './routes/auth_routes';
import PostRoutes from './routes/post_routes';
import CommentRoutes from './routes/comment_routes';
import LikeRoutes from './routes/like_routes';
import MessagesRoutes from './routes/message_routes';
import UserRoutes from './routes/user_routes';
import FollowRoutes from './routes/follow_routes';

dotenv.config();

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
  origin: 'http://localhost:5173',
  credentials: true, 
}));


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/auth', AuthRoutes);
app.use('/api/post', PostRoutes);
app.use('/api/comment', CommentRoutes);
app.use('/api/like', LikeRoutes);
app.use('/api/messages', MessagesRoutes);
app.use('/api/user', UserRoutes);
app.use('/api', FollowRoutes);

const uploadDir = path.join(__dirname , "uploads/posts");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.post("/upload/post", upload.single("image"), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const imageUrl = `/uploads/posts/${req.file.filename}`;
    
    res.json({ success: true, imageUrl});
  } catch (error) {
    console.error("Error uploading post:", error);
    res.status(500).json({ message: "Failed to upload post" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

export default app;