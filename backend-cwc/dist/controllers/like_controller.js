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
const like_model_1 = __importDefault(require("../models/like_model"));
const createLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { postId } = req.body;
        if (!userId || !postId) {
            res.status(400).json({ success: false, message: "UserId and postId are required" });
            return;
        }
        const like = yield like_model_1.default.create({ userId, postId });
        res.status(201).json({ success: true, data: like });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const getLikes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const likes = yield like_model_1.default.find();
        if (!likes) {
            res.status(404).json({ message: "No likes found" });
            return;
        }
        res.status(200).json({ likes, success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const deleteLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const likeId = req.params.likeId;
        const like = yield like_model_1.default.findByIdAndDelete(likeId);
        if (!like) {
            res.status(404).json({ message: "Like not found" });
            return;
        }
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const getLikesByPostId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const likes = yield like_model_1.default.find({ postId });
        if (!likes) {
            res.status(404).json({ message: "No likes found" });
            return;
        }
        res.status(200).json({ likes, success: true });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
const LikeControllers = { createLike, getLikes, deleteLike, getLikesByPostId };
exports.default = LikeControllers;
