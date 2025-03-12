import express from "express";
import authControllers from "../controllers/auth_controller";
import { authMiddleware } from "../controllers/auth_controller";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: API for user authentication and token management.
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
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *           example: "60d0fe4f5311236168a109ca"
 *         name:
 *           type: string
 *           description: The user's name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *           example: "john@example.com"
 *         bio:
 *           type: string
 *           description: A short biography of the user
 *           example: "Coffee lover"
 *         favorite_coffee:
 *           type: string
 *           description: The user's favorite coffee type
 *           example: "Espresso"
 *         location:
 *           type: string
 *           description: The user's location
 *           example: "NYC"
 *         joined_date:
 *           type: string
 *           format: date-time
 *           description: Date when the user joined
 *           example: "2021-06-21T14:28:00.000Z"
 *         followers_count:
 *           type: number
 *           description: Number of followers
 *           example: 10
 *         following_count:
 *           type: number
 *           description: Number of accounts the user is following
 *           example: 5
 *         posts_count:
 *           type: number
 *           description: Number of posts by the user
 *           example: 3
 *         profile_pic:
 *           type: string
 *           description: URL to the user's profile picture
 *           example: "/profile.png"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         accessToken:
 *           type: string
 *         id:
 *           type: string
 *
 *     LogoutResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Logged out successfully"
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               location:
 *                 type: string
 *                 example: "NYC"
 *               bio:
 *                 type: string
 *                 example: "Coffee lover"
 *               favorite_coffee:
 *                 type: string
 *                 example: "Espresso"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 id:
 *                   type: string
 *                   example: "60d0fe4f5311236168a109ca"
 *       400:
 *         description: Missing email or password
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Internal server error
 */
router.post("/register", authControllers.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       description: User login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               description: Refresh token cookie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       404:
 *         description: User not found
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post("/login", authControllers.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           Bearer token. Example: "Bearer {accessToken}"
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       401:
 *         description: Unauthorized or invalid token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/me", authControllers.getUser);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: cookie
 *         name: refreshToken
 *         schema:
 *           type: string
 *         required: false
 *         description: Refresh token provided as a cookie.
 *     requestBody:
 *       description: Optional Google token for revocation
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               googleToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LogoutResponse"
 *       500:
 *         description: Internal server error
 */
router.post("/logout", authControllers.logout);

router.post("/generateContent", authControllers.chatController);

router.get("/getUserNameById/:id", authControllers.getNameByid);

router.post("/google", authControllers.googleLogin);

export default router;
