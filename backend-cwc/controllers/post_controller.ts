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
        const page = parseInt(req.query.page as string) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .populate({
                path: "userId",
                select: "name profile_pic",
                model: "User"
            }) 
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); 

 

        res.status(200).json({
            posts,
            currentPage: page,
            totalPages: Math.ceil((await Post.countDocuments()) / limit),
            hasMore: skip + limit < (await Post.countDocuments()),
            success: true
        });
    } catch (error) {
        console.error("❌ API Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6; 
      const skip = (page - 1) * limit;
  
      const posts = await Post.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
        
      const totalPosts = await Post.countDocuments({ userId });
  
      res.status(200).json({
        posts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        hasMore: skip + limit < totalPosts,
        success: true,
      });
    } catch (error) {
      console.error("❌ API Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
const updatePostById = async (req: Request, res: Response) => {
    try {
        const postId = req.params.postId;
        const { content, tags, image } = req.body;
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
        post.image = image || post.image; 

        await post.save();

        res.status(200).json({ success: true, data: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const fs = require('fs');
const path = require('path');

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
  
      if (post.image) {
        const imagePath = path.join(__dirname, '../uploads/posts/', post.image);
        try {
          await fs.promises.unlink(imagePath);
        } catch (err) {
          console.error("Error deleting image file:", err);
        }
      }
  
      await post.deleteOne();
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error in deletePostById:", error);
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


        
