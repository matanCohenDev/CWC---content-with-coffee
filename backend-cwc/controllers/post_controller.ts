import { Request , Response } from "express";
import Post from "../models/post_model";
import User from "../models/user_model";

const createPost = async (req: Request, res: Response) => {
    try {
        const { content, image } = req.body;
        const userId = req.user?._id; 

        if (!content || !userId) {
            res.status(400).json({ success: false, message: "Content and userId are required" });
            return;
        }

        const post = await Post.create({ userId, content, image });
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        if (user.posts_count !== undefined) {
            user.posts_count += 1;
        } else {
            user.posts_count = 1;
        }
        await user.save();
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find();
        if (!posts) {
            res.status(404).json({ message: "No posts found" });
            return;
        }
        res.status(200).json({posts : posts , success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const getPostById = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        res.status(200).json({ post , success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const getPostByUserId = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId; 
        const posts = await Post.find({
            userId: userId 
        });
        if (!posts) {
            res.status(404).json({ message: "No posts found" });
            return;
        }
        res.status(200).json({ posts ,success: true });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const updatePostById = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const { content, tags } = req.body;
        const userId = req.user?._id;

        const post = await Post.findById(postId);
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
        await post.save();

        res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const deletePostById = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const userId = req.user?._id;

        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }

        if (post.userId !== userId) {
            res.status(403).json({ success: false, message: "Unauthorized to delete this post" });
            return;
        }

        await post.deleteOne();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updateLikeToPost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        post.likesCount += 1;
        await post.save();
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const removeLikeToPost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        post.likesCount -= 1;
        await post.save();
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const updateCommentToPost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        post.commentsCount += 1;
        await post.save();
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const removeCommentToPost = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ success: false, message: "Post not found" });
            return;
        }
        post.commentsCount -= 1;
        await post.save();
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
 
const PostController = { createPost, getPosts, getPostById, getPostByUserId, updatePostById, deletePostById , updateLikeToPost , removeLikeToPost ,updateCommentToPost , removeCommentToPost};

export default PostController;


        
