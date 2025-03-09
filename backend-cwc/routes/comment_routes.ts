import express from "express";
import CommentControllers from "../controllers/comment_controller";
import { Router } from "express";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: API for managing comments
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
 *     Comment:
 *       type: object
 *       required:
 *         - userId
 *         - postId
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the comment
 *           example: "60d0fe4f5311236168a109ca"
 *         userId:
 *           type: string
 *           description: The ID of the user who created the comment
 *           example: "60d0fe4f5311236168a109cb"
 *         postId:
 *           type: string
 *           description: The ID of the post associated with the comment
 *           example: "60d0fe4f5311236168a109cc"
 *         content:
 *           type: string
 *           description: The content of the comment
 *           example: "This is a great post!"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the comment was created
 *           example: "2024-01-08T12:34:56Z"
 */

/**
 * @swagger
 * /api/comment/createComment:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Data required to create a comment
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - content
 *             properties:
 *               postId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109cc"
 *               content:
 *                 type: string
 *                 example: "I love this post!"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/Comment"
 *       400:
 *         description: Missing required fields (userId, postId or content)
 *       500:
 *         description: Internal server error
 */
router.post("/createComment", authMiddleware, CommentControllers.createComment);

/**
 * @swagger
 * /api/comment/getComments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: List of comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Comment"
 *       404:
 *         description: No comments found
 *       500:
 *         description: Internal server error
 */
router.get("/getComments", CommentControllers.getComments);

/**
 * @swagger
 * /api/comment/getCommentById/{commentId}:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the comment
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comment:
 *                   $ref: "#/components/schemas/Comment"
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.get("/getCommentById/:commentId", CommentControllers.getCommentById);

/**
 * @swagger
 * /api/comment/getCommentsByPostId/{postId}:
 *   get:
 *     summary: Get all comments for a specific post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the post
 *     responses:
 *       200:
 *         description: List of comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Comment"
 *       404:
 *         description: No comments found for this post
 *       500:
 *         description: Internal server error
 */
router.get("/getCommentsByPostId/:postId", authMiddleware, CommentControllers.getCommentsByPostId);

/**
 * @swagger
 * /api/comment/updateComment/{commentId}:
 *   put:
 *     summary: Update a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the comment
 *     requestBody:
 *       description: Updated comment content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated comment content"
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       403:
 *         description: Not authorized to update this comment
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.put("/updateComment/:commentId", authMiddleware, CommentControllers.updateComment);

/**
 * @swagger
 * /api/comment/deleteComment/{commentId}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the comment
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       403:
 *         description: Not authorized to delete this comment
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
router.delete("/deleteComment/:commentId", authMiddleware, CommentControllers.deleteComment);

export default router;
