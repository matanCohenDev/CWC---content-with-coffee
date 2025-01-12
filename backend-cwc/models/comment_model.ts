
import mongoose from "mongoose";

export interface CommentInterface {
    _id?: string;
    userId: string;
    postId: string;
    content: string;
    createdAt?: Date;
}

const commentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    postId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
