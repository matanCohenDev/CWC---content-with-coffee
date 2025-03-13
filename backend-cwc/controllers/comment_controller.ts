import { Request , Response } from "express";
import Comment from "../models/comment_model";

const createComment = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const { postId, content } = req.body;

        if (!userId || !postId || !content) {
            res.status(400).json({ success: false, message: "UserId, postId and content are required" });
            return;
        }

        const comment = await Comment.create({ userId, postId, content });
        res.status(201).json({ success: true, data: comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getComments = async (req: Request, res: Response) => {
    try {
        const comments = await Comment.find();
        if (!comments) {
            res.status(404).json({ message: "No comments found" });
            return;
        }
        res.status(200).json({ comments , success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const getCommentById = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.commentId;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        res.status(200).json({ comment , success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const getCommentsByPostId = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const comments = await Comment.find({postId});
        if (!comments || comments.length === 0) {
            res.status(404).json({ message: "No comments found" });
            return;
        }
        res.status(200).json({ comments , success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteComment = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.commentId;
        const comment = await Comment.findByIdAndDelete(commentId);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const updateComment = async (req: Request, res: Response) => {
    try {
        const commentId = req.params.commentId;
        const { content } = req.body;
        const userId = req.user?._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            res.status(404).json({ success: false, message: "Comment not found" });
            return;
        }

        if (comment.userId.toString() !== userId) {
            res.status(403).json({ success: false, message: "Not authorized to update this comment" });
            return;
        }

        comment.content = content;
        await comment.save();
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
const commentController = { createComment, getComments, getCommentById, getCommentsByPostId, deleteComment, updateComment };
export default commentController;

