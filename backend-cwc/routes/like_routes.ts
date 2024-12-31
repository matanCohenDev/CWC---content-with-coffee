import express  from "express";
import LikeControllers from "../controllers/like_controller";
import { Router } from "express";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

router.post("/createLike",authMiddleware , LikeControllers.createLike);

router.get("/getLikes",authMiddleware, LikeControllers.getLikes);

router.get("/getLikesByPostId/:postId",authMiddleware , LikeControllers.getLikesByPostId);
 
router.delete("/deleteLike/:likeId",authMiddleware , LikeControllers.deleteLike);

export default router;

