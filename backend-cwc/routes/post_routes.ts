import express from "express";
import PostControllers from "../controllers/post_controller";
import { Router } from "express";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

router.post("/createPost", authMiddleware, PostControllers.createPost);

router.get("/getPosts", PostControllers.getPosts);

router.get("/getPostById/:postId", PostControllers.getPostById);

router.get("/getPostByUserId/:userId" ,authMiddleware , PostControllers.getPostByUserId);

router.put("/updatePostById/:postId", authMiddleware, PostControllers.updatePostById);

router.delete("/deletePostById/:postId", authMiddleware, PostControllers.deletePostById);

router.post("/likePost/:postId", authMiddleware, PostControllers.updateLikeToPost);

router.delete("/removeLike/:postId", authMiddleware, PostControllers.removeLikeToPost);

router.post("/commentPost/:postId", authMiddleware, PostControllers.updateCommentToPost);

router.delete("/removeComment/:postId", authMiddleware, PostControllers.removeCommentToPost);

export default router;