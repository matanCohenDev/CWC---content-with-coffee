import mongoose from "mongoose";

export interface LikeInterface {
    _id?: string;
    userId: string;
    postId: string;
    createdAt?: Date;
}

const likeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    postId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Like = mongoose.model("Like", likeSchema);
export default Like;
