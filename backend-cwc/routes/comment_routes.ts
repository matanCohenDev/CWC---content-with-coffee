import express from "express";
import CommentControllers from "../controllers/comment_controller";
import { Router } from "express";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

router.post("/createComment", authMiddleware, CommentControllers.createComment);

router.get("/getComments", CommentControllers.getComments);

router.get("/getCommentById/:commentId", CommentControllers.getCommentById);

router.get("/getCommentsByPostId/:postId", authMiddleware, CommentControllers.getCommentsByPostId);

router.put("/updateComment/:commentId", authMiddleware, CommentControllers.updateComment);

router.delete("/deleteComment/:commentId", authMiddleware, CommentControllers.deleteComment);

export default router;