"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user_controller"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: API for managing users
 */
/**
 * @swagger
 * components:
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
 *         followers_count:
 *           type: number
 *           description: Number of followers the user has
 *           example: 10
 *         following_count:
 *           type: number
 *           description: Number of users the user is following
 *           example: 5
 *         posts_count:
 *           type: number
 *           description: Number of posts by the user
 *           example: 3
 *         profile_pic:
 *           type: string
 *           description: URL to the user's profile picture
 *           example: "/profile.png"
 */
/**
 * @swagger
 * /api/user/getUserById/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/getUserById/:id", user_controller_1.default.getUserById);
/**
 * @swagger
 * /api/user/getUsers:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 *       500:
 *         description: Internal server error
 */
router.get("/getUsers", user_controller_1.default.getUsers);
/**
 * @swagger
 * /api/user/deleteUser/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete("/deleteUser/:id", user_controller_1.default.deleteUser);
/**
 * @swagger
 * /api/user/updateUser/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the user to update
 *     requestBody:
 *       description: Data for updating the user
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
 *                 example: "john@example.com"
 *               bio:
 *                 type: string
 *                 example: "Updated bio"
 *               favorite_coffee:
 *                 type: string
 *                 example: "Latte"
 *               location:
 *                 type: string
 *                 example: "NYC"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User updated successfully"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put("/updateUser/:id", user_controller_1.default.updateUser);
exports.default = router;
