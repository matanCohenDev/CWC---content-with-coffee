import {Request, Response}  from "express";
import Like from "../models/like_model";

const createLike = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const { postId } = req.body;

        if (!userId || !postId) {
            res.status(400).json({ success: false, message: "UserId and postId are required" });
            return;
        }

        const like = await Like.create({ userId, postId });
        res.status(201).json({ success: true, data: like });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getLikes = async (req: Request, res: Response) => {
    try {
        const likes = await Like.find();
        if (!likes) {
            res.status(404).json({ message: "No likes found" });
            return;
        }
        res.status(200).json({ likes , success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const deleteLike = async (req: Request, res: Response) => {
    try {
        const likeId = req.params.likeId;
        const like = await Like.findByIdAndDelete(likeId);
        if (!like) {
            res.status(404).json({ message: "Like not found" });
            return;
        }
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const getLikesByPostId = async (req:Request , res:Response) => {
    try {
        const postId = req.params.postId;
        const likes = await Like.find({postId});
        if (!likes) {
            res.status(404).json({ message: "No likes found" });
            return;
        }
        res.status(200).json({ likes , success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}


const LikeControllers = { createLike, getLikes, deleteLike , getLikesByPostId };

export default LikeControllers;


