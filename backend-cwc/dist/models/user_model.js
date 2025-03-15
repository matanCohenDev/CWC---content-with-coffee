"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: false,
        validate: {
            validator: function (value) {
                if (!this.isGoogleUser && (!value || value.length === 0)) {
                    return false;
                }
                return true;
            },
            message: "Password is required for non-Google users",
        },
    },
    isGoogleUser: {
        type: Boolean,
        default: false,
    },
    bio: {
        type: String,
        default: ''
    },
    favorite_coffee: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    joined_date: {
        type: Date,
        default: Date.now
    },
    followers_count: {
        type: Number,
        default: 0
    },
    following_count: {
        type: Number,
        default: 0
    },
    posts_count: {
        type: Number,
        default: 0
    },
    profile_pic: {
        type: String,
        default: "/profile.png"
    },
    refreshToken: {
        type: Array,
        default: []
    }
});
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
