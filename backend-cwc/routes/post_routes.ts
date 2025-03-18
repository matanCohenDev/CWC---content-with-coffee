import express from "express";
import PostControllers from "../controllers/post_controller";
import { Router } from "express";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: API for managing posts
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
 *     Post:
 *       type: object
 *       required:
 *         - userId
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the post
 *           example: "60d0fe4f5311236168a109ca"
 *         userId:
 *           type: string
 *           description: The ID of the user who created the post
 *           example: "60d0fe4f5311236168a109cb"
 *         content:
 *           type: string
 *           description: The content of the post
 *           example: "This is my first post!"
 *         image:
 *           type: string
 *           description: URL to the post image
 *           example: "http://example.com/image.jpg"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: List of tags associated with the post
 *           example: ["coffee", "morning"]
 *         likesCount:
 *           type: number
 *           description: Number of likes for the post
 *           example: 10
 *         commentsCount:
 *           type: number
 *           description: Number of comments for the post
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the post was created
 *           example: "2024-01-08T12:34:56Z"
 */

/**
 * @swagger
 * /api/post/createPost:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Data required to create a post
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is my first post!"
 *               image:
 *                 type: string
 *                 example: "http://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/Post"
 *       400:
 *         description: Missing required fields (content or userId)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/createPost", authMiddleware, PostControllers.createPost);

/**
 * @swagger
 * /api/post/getPosts:
 *   get:
 *     summary: Retrieve all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Post"
 *       404:
 *         description: No posts found
 *       500:
 *         description: Internal server error
 */
router.get("/getPosts", PostControllers.getPosts);

/**
 * @swagger
 * /api/post/getPostById/{postId}:
 *   get:
 *     summary: Retrieve a post by its ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 post:
 *                   $ref: "#/components/schemas/Post"
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.get("/getPostById/:postId", PostControllers.getPostById);

/**
 * @swagger
 * /api/post/getPostByUserId/{userId}:
 *   get:
 *     summary: Retrieve posts by a specific user
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose posts are to be retrieved
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Post"
 *       404:
 *         description: No posts found for the user
 *       500:
 *         description: Internal server error
 */
router.get("/getPostByUserId/:userId", authMiddleware, PostControllers.getPostByUserId);

/**
 * @swagger
 * /api/post/updatePostById/{postId}:
 *   put:
 *     summary: Update a post by its ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to update
 *     requestBody:
 *       description: Data required to update the post
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated post content"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["updated", "coffee"]
 *               image:
 *                 type: string
 *                 example: "http://example.com/new-image.jpg"
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/Post"
 *       403:
 *         description: Unauthorized to update this post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.put("/updatePostById/:postId", authMiddleware, PostControllers.updatePostById);

/**
 * @swagger
 * /api/post/deletePostById/{postId}:
 *   delete:
 *     summary: Delete a post by its ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       403:
 *         description: Unauthorized to delete this post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.delete("/deletePostById/:postId", authMiddleware, PostControllers.deletePostById);

/**
 * @swagger
 * /api/post/likePost/{postId}:
 *   post:
 *     summary: Increment the like count on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to like
 *     responses:
 *       200:
 *         description: Like count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/Post"
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.post("/likePost/:postId", authMiddleware, PostControllers.updateLikeToPost);

/**
 * @swagger
 * /api/post/removeLike/{postId}:
 *   delete:
 *     summary: Decrement the like count on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to remove a like from
 *     responses:
 *       200:
 *         description: Like count decremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/Post"
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.delete("/removeLike/:postId", authMiddleware, PostControllers.removeLikeToPost);

/**
 * @swagger
 * /api/post/commentPost/{postId}:
 *   post:
 *     summary: Increment the comment count on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to add a comment to
 *     responses:
 *       200:
 *         description: Comment count incremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/Post"
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.post("/commentPost/:postId", authMiddleware, PostControllers.updateCommentToPost);

/**
 * @swagger
 * /api/post/removeComment/{postId}:
 *   delete:
 *     summary: Decrement the comment count on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to remove a comment from
 *     responses:
 *       200:
 *         description: Comment count decremented successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/Post"
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.delete("/removeComment/:postId", authMiddleware, PostControllers.removeCommentToPost);
router.get("/getPostsByUserId/:userId",authMiddleware, PostControllers.getPaginatedPostsByUserId);


export default router;
