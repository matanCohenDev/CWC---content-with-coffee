"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const followSchema = new mongoose_1.default.Schema({
    followerId: {
        type: String,
        required: true,
    },
    followingId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});
const Follow = mongoose_1.default.model('Follow', followSchema);
exports.default = Follow;
