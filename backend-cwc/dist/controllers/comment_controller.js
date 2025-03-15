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
const comment_model_1 = __importDefault(require("../models/comment_model"));
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { postId, content } = req.body;
        if (!userId || !postId || !content) {
            res.status(400).json({ success: false, message: "UserId, postId and content are required" });
            return;
        }
        const comment = yield comment_model_1.default.create({ userId, postId, content });
        res.status(201).json({ success: true, data: comment });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const getComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comments = yield comment_model_1.default.find();
        if (!comments) {
            res.status(404).json({ message: "No comments found" });
            return;
        }
        res.status(200).json({ comments, success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const getCommentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commentId = req.params.commentId;
        const comment = yield comment_model_1.default.findById(commentId);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        res.status(200).json({ comment, success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const getCommentsByPostId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const comments = yield comment_model_1.default.find({ postId });
        if (!comments || comments.length === 0) {
            res.status(404).json({ message: "No comments found" });
            return;
        }
        res.status(200).json({ comments, success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commentId = req.params.commentId;
        const comment = yield comment_model_1.default.findByIdAndDelete(commentId);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const commentId = req.params.commentId;
        const { content } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const comment = yield comment_model_1.default.findById(commentId);
        if (!comment) {
            res.status(404).json({ success: false, message: "Comment not found" });
            return;
        }
        if (comment.userId.toString() !== userId) {
            res.status(403).json({ success: false, message: "Not authorized to update this comment" });
            return;
        }
        comment.content = content;
        yield comment.save();
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const commentController = { createComment, getComments, getCommentById, getCommentsByPostId, deleteComment, updateComment };
exports.default = commentController;
