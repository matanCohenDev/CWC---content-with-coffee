import mongoose from "mongoose";

export interface PostInterface {
    _id?: string;
    userId: string;
    content: string;
    image?: string;
    tags?: string[];
    createdAt?: Date;
    likesCount?: number;
    commentsCount?: number;
}

const postSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image:{
        type: String,
        default: '',
    },
    tags:{
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    likesCount:{
        type: Number,
        default: 0,
    },
    commentsCount:{
        type: Number,
        default: 0,
    }
});

const Post = mongoose.model("Post", postSchema);
export default Post;
    