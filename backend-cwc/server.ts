import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from "cookie-parser";
import AuthRoutes from './routes/auth_routes';
import PostRoutes from './routes/post_routes';
import CommentRoutes from './routes/comment_routes';
import LikeRoutes from './routes/like_routes';
import MessagesRoutes from './routes/message_routes';
import UserRoutes from './routes/user_routes';

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


export default app;