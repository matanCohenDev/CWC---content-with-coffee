"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messages_controller_1 = __importDefault(require("../controllers/messages_controller"));
const auth_controller_1 = require("../controllers/auth_controller");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   - name: Messages
 *     description: API for managing user messages
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
 *     Message:
 *       type: object
 *       required:
 *         - senderId
 *         - receiverId
 *         - content
 *         - messageRead
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the message
 *           example: "60d0fe4f5311236168a109ca"
 *         senderId:
 *           type: string
 *           description: The ID of the user who sent the message
 *           example: "60d0fe4f5311236168a109cb"
 *         receiverId:
 *           type: string
 *           description: The ID of the user receiving the message
 *           example: "60d0fe4f5311236168a109cc"
 *         content:
 *           type: string
 *           description: The message content
 *           example: "Hello, how are you?"
 *         messageRead:
 *           type: boolean
 *           description: Indicates if the message has been read
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the message was created
 *           example: "2024-01-08T12:34:56Z"
 */
/**
 * @swagger
 * /api/message/SendMessage:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Data required to send a message
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderId
 *               - receiverId
 *               - content
 *             properties:
 *               senderId:
 *                 type: string
 *                 description: The ID of the sender
 *                 example: "60d0fe4f5311236168a109cb"
 *               receiverId:
 *                 type: string
 *                 description: The ID of the receiver
 *                 example: "60d0fe4f5311236168a109cc"
 *               content:
 *                 type: string
 *                 description: The message content
 *                 example: "Hello, how are you?"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messageId:
 *                   type: string
 *                   example: "60d0fe4f5311236168a109ca"
 *                 data:
 *                   $ref: "#/components/schemas/Message"
 *       400:
 *         description: Missing required fields (senderId, receiverId, or content)
 *       500:
 *         description: Internal server error
 */
router.post('/SendMessage', auth_controller_1.authMiddleware, messages_controller_1.default.sendMessage);
/**
 * @swagger
 * /api/message/GetAllMessages:
 *   get:
 *     summary: Retrieve all messages for a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve messages for
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Message"
 *       400:
 *         description: Missing or invalid userId
 *       500:
 *         description: Internal server error
 */
router.get('/GetAllMessages', auth_controller_1.authMiddleware, messages_controller_1.default.getAllUserMessages);
/**
 * @swagger
 * /api/message/GetMessagesBetweenUsers:
 *   get:
 *     summary: Retrieve messages exchanged between two users
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: senderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The sender's user ID
 *       - in: query
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: The receiver's user ID
 *     responses:
 *       200:
 *         description: Messages between users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Message"
 *       400:
 *         description: Missing or invalid senderId or receiverId
 *       404:
 *         description: No messages found between users
 *       500:
 *         description: Internal server error
 */
router.get('/GetMessagesBetweenUsers', auth_controller_1.authMiddleware, messages_controller_1.default.getMessagesBetweenUsers);
/**
 * @swagger
 * /api/message/MarkMessageAsRead:
 *   put:
 *     summary: Mark a message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Data to mark a message as read
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: The ID of the message to mark as read
 *                 example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Message marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: "#/components/schemas/Message"
 *       400:
 *         description: Missing messageId
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
router.put('/MarkMessageAsRead', auth_controller_1.authMiddleware, messages_controller_1.default.messageRead);
/**
 * @swagger
 * /api/message/DeleteMessage:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Data required to delete a message
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: The ID of the message to delete
 *                 example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       201:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Message deleted"
 *       400:
 *         description: Missing messageId
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
router.delete('/DeleteMessage', auth_controller_1.authMiddleware, messages_controller_1.default.deleteMessage);
exports.default = router;
