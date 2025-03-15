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
const post_model_1 = __importDefault(require("../models/post_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { content, image } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!content || !userId) {
            res.status(400).json({ success: false, message: "Content and userId are required" });
            return;
        }
        const post = yield post_model_1.default.create({ userId, content, image });
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        if (user.posts_count !== undefined) {
            user.posts_count += 1;
        }
        else {
            user.posts_count = 1;
        }
        yield user.save();
        res.status(201).json({ success: true, data: post });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const getPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield post_model_1.default.find();
        if (!posts) {
            res.status(404).json({ message: "No posts found" });
            return;
        }
        res.status(200).json({ posts: posts, success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const getPostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const post = yield post_model_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        res.status(200).json({ post, success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const getPostByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const posts = yield post_model_1.default.find({
            userId: userId
        });
        if (!posts) {
            res.status(404).json({ message: "No posts found" });
            return;
        }
        res.status(200).json({ posts, success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const updatePostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const postId = req.params.postId;
        const { content, tags, image } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const post = yield post_model_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        if (post.userId !== userId) {
            res.status(403).json({ success: false, message: "Unauthorized to update this post" });
            return;
        }
        post.content = content || post.content;
        post.tags = tags || post.tags;
        post.image = image || post.image;
        yield post.save();
        res.status(200).json({ success: true, data: post });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const deletePostById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const postId = req.params.postId;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const post = yield post_model_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        if (post.userId !== userId) {
            res.status(403).json({ success: false, message: "Unauthorized to delete this post" });
            return;
        }
        yield post.deleteOne();
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const updateLikeToPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const post = yield post_model_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        post.likesCount += 1;
        yield post.save();
        res.status(200).json({ success: true, data: post });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const removeLikeToPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const post = yield post_model_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        post.likesCount -= 1;
        yield post.save();
        res.status(200).json({ success: true, data: post });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const updateCommentToPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const post = yield post_model_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        post.commentsCount += 1;
        yield post.save();
        res.status(200).json({ success: true, data: post });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const removeCommentToPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const post = yield post_model_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        post.commentsCount -= 1;
        yield post.save();
        res.status(200).json({ success: true, data: post });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const PostController = { createPost, getPosts, getPostById, getPostByUserId, updatePostById, deletePostById, updateLikeToPost, removeLikeToPost, updateCommentToPost, removeCommentToPost };
exports.default = PostController;
