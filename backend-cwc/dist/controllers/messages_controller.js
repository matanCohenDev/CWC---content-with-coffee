"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messages_model_1 = __importDefault(require("../models/messages_model"));
const mongoose_1 = __importDefault(require("mongoose"));
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, receiverId, content } = req.body;
        if (!senderId || !receiverId || !content) {
            res.status(400).json({ success: false, message: "SenderId, receiverId and content are required" });
            return;
        }
        const message = yield messages_model_1.default.create({ senderId, receiverId, content });
        res.status(201).json({ success: true, messageId: message._id, data: message });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const getAllUserMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        if (!userId) {
            res.status(400).json({ success: false, message: "UserId is required" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ success: false, message: "Invalid userId" });
            return;
        }
        const messages = yield messages_model_1.default.find({
            $or: [
                { senderId: userId },
                { receiverId: userId },
            ],
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: messages });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const getMessagesBetweenUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { senderId, receiverId } = req.query;
        // המרת הפרמטרים למחרוזת במידה והם מערכים
        senderId = Array.isArray(senderId) ? senderId[0] : senderId;
        receiverId = Array.isArray(receiverId) ? receiverId[0] : receiverId;
        if (!senderId || !receiverId) {
            res.status(400).json({ success: false, message: "SenderId and receiverId are required" });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(senderId) ||
            !mongoose_1.default.Types.ObjectId.isValid(receiverId)) {
            res.status(400).json({ success: false, message: "Invalid senderId or receiverId" });
            return;
        }
        const messages = yield messages_model_1.default.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        }).sort({ createdAt: 1 });
        if (!messages || messages.length === 0) {
            res.status(404).json({ success: false, message: "No messages found between users" });
            return;
        }
        res.status(200).json({ success: true, data: messages });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const messageRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId } = req.body;
        if (!messageId) {
            res.status(400).json({ success: false, message: "MessageId is required" });
            return;
        }
        const message = yield messages_model_1.default.findById(messageId);
        if (!message) {
            res.status(404).json({ success: false, message: "Message not found" });
            return;
        }
        message.messageRead = true;
        yield message.save();
        res.status(200).json({ success: true, data: message });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId } = req.body;
        if (!messageId) {
            res.status(400).json({ success: false, message: "MessageId is required" });
            return;
        }
        const message = yield messages_model_1.default.findByIdAndDelete(messageId);
        if (!message) {
            res.status(404).json({ success: false, message: "Message not found" });
            return;
        }
        res.status(201).json({ success: true, message: "Message deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
const messageController = {
    sendMessage,
    getAllUserMessages,
    getMessagesBetweenUsers,
    messageRead,
    deleteMessage
};
exports.default = messageController;
