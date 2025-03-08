import mongoose from 'mongoose';

export interface FollowInterface {
    _id?: string;
    followerId: string;
    followingId: string;
    createdAt?: Date;
}

const followSchema = new mongoose.Schema({
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

const Follow = mongoose.model('Follow', followSchema);
export default Follow;