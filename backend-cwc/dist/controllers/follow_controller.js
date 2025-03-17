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
exports.followController = void 0;
const follow_model_1 = __importDefault(require("../models/follow_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
const follow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { followingId } = req.body;
    if (!followingId) {
        res.status(400).json({ message: "followingId is required" });
        return;
    }
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const followerId = req.user._id;
    try {
        const existing = yield follow_model_1.default.findOne({ followerId, followingId });
        if (existing) {
            res.status(400).json({ message: "Already following" });
            return;
        }
        const follow = yield follow_model_1.default.findOne({ followerId: followerId, followingId: followingId });
        if (follow) {
            res.status(400).json({ message: "Already following" });
            return;
        }
        const newFollow = new follow_model_1.default({ followerId, followingId });
        yield newFollow.save();
        const followingUser = yield user_model_1.default.findById(followingId);
        if (!followingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (typeof followingUser.followers_count === 'number') {
            followingUser.followers_count += 1;
        }
        else {
            followingUser.followers_count = 1;
        }
        const followerUser = yield user_model_1.default.findById(followerId);
        if (!followerUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (typeof followerUser.following_count === 'number') {
            followerUser.following_count += 1;
        }
        else {
            followerUser.following_count = 1;
        }
        yield followingUser.save();
        yield followerUser.save();
        res.status(200).json({ message: "Followed" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
const unfollow = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { followingId } = req.body;
    if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const followerId = req.user._id;
    try {
        const follow = yield follow_model_1.default.findOne({ followerId: followerId, followingId: followingId });
        if (!follow) {
            res.status(400).json({ message: "Not following" });
            return;
        }
        const followingUser = yield user_model_1.default.findById(followingId);
        if (!followingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (typeof followingUser.followers_count === 'number') {
            followingUser.followers_count -= 1;
        }
        else {
            followingUser.followers_count = 0;
        }
        yield followingUser.save();
        const followerUser = yield user_model_1.default.findById(followerId);
        if (!followerUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (typeof followerUser.following_count === 'number') {
            followerUser.following_count -= 1;
        }
        else {
            followerUser.following_count = 0;
        }
        yield followerUser.save();
        yield follow_model_1.default.findByIdAndDelete(follow._id);
        res.status(200).json({ message: "Successfully unfollowed", success: true });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
const getAllFollowersByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const followers = yield follow_model_1.default.find({ followingId: userId });
        res.status(200).json(followers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
const getAllFollowingByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const following = yield follow_model_1.default.find({ followerId: userId });
        res.status(200).json({ following });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
const followController = { follow, unfollow, getAllFollowersByUserId, getAllFollowingByUserId };
exports.followController = followController;
