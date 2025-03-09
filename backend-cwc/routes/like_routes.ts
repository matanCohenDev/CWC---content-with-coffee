import express from "express";
import LikeControllers from "../controllers/like_controller";
import { Router } from "express";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Likes
 *     description: API for managing likes on posts
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Like:
 *       type: object
 *       required:
 *         - userId
 *         - postId
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the like
 *           example: "60d0fe4f5311236168a109ca"
 *         userId:
 *           type: string
 *           description: The ID of the user who liked the post
 *           example: "60d0fe4f5311236168a109cb"
 *         postId:
 *           type: string
 *           description: The ID of the post that was liked
 *           example: "60d0fe4f5311236168a109cc"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the like was created
 *           example: "2024-01-08T12:34:56Z"
 */

/**
 * @swagger
 * /api/like/createLike:
 *   post:
 *     summary: Create a like on a post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Data required to create a like
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The ID of the post to like
 *                 example: "60d0fe4f5311236168a109cc"
 *     responses:
 *       201:
 *         description: Like created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/Like"
 *       400:
 *         description: Missing required fields (userId or postId)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/createLike", authMiddleware, LikeControllers.createLike);

/**
 * @swagger
 * /api/like/getLikes:
 *   get:
 *     summary: Retrieve all likes
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of likes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 likes:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Like"
 *       404:
 *         description: No likes found
 *       500:
 *         description: Internal server error
 */
router.get("/getLikes", authMiddleware, LikeControllers.getLikes);

/**
 * @swagger
 * /api/like/getLikesByPostId/{postId}:
 *   get:
 *     summary: Retrieve likes for a specific post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve likes for
 *     responses:
 *       200:
 *         description: List of likes for the post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 likes:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Like"
 *       404:
 *         description: No likes found for this post
 *       500:
 *         description: Internal server error
 */
router.get("/getLikesByPostId/:postId", authMiddleware, LikeControllers.getLikesByPostId);

/**
 * @swagger
 * /api/like/deleteLike/{likeId}:
 *   delete:
 *     summary: Delete a like by its ID
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: likeId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the like to be deleted
 *     responses:
 *       200:
 *         description: Like deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Like not found
 *       500:
 *         description: Internal server error
 */
router.delete("/deleteLike/:likeId", authMiddleware, LikeControllers.deleteLike);

export default router;
