"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const follow_controller_1 = require("../controllers/follow_controller");
const auth_controller_1 = require("../controllers/auth_controller");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Follow
 *     description: API for following and unfollowing users
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
 *     Follow:
 *       type: object
 *       required:
 *         - followerId
 *         - followingId
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the follow record
 *           example: "60d0fe4f5311236168a109ca"
 *         followerId:
 *           type: string
 *           description: The ID of the user who is following
 *           example: "60d0fe4f5311236168a109cb"
 *         followingId:
 *           type: string
 *           description: The ID of the user being followed
 *           example: "60d0fe4f5311236168a109cc"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the follow was created
 *           example: "2024-01-08T12:34:56Z"
 */
/**
 * @swagger
 * /api/follow/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Follow request data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followingId:
 *                 type: string
 *                 description: The ID of the user to follow
 *                 example: "60d0fe4f5311236168a109cc"
 *     responses:
 *       200:
 *         description: Followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Followed"
 *       400:
 *         description: Already following or missing required fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/follow', auth_controller_1.authMiddleware, follow_controller_1.followController.follow);
/**
 * @swagger
 * /api/follow/unfollow:
 *   post:
 *     summary: Unfollow a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Unfollow request data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followingId:
 *                 type: string
 *                 description: The ID of the user to unfollow
 *                 example: "60d0fe4f5311236168a109cc"
 *     responses:
 *       200:
 *         description: Unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully unfollowed"
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Not following or missing required fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/unfollow', auth_controller_1.authMiddleware, follow_controller_1.followController.unfollow);
/**
 * @swagger
 * /api/follow/followers/{userId}:
 *   get:
 *     summary: Get all followers of a user
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to retrieve followers for
 *     responses:
 *       200:
 *         description: List of followers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Follow"
 *       500:
 *         description: Internal server error
 */
router.get('/followers/:userId', follow_controller_1.followController.getAllFollowersByUserId);
/**
 * @swagger
 * /api/follow/following/{userId}:
 *   get:
 *     summary: Get all users a user is following
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to retrieve the following list for
 *     responses:
 *       200:
 *         description: List of following users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 following:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Follow"
 *       500:
 *         description: Internal server error
 */
router.get('/following/:userId', follow_controller_1.followController.getAllFollowingByUserId);
exports.default = router;
