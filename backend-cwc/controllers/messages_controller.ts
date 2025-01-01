import {Request , Response} from 'express';
import Message from '../models/messages_model';
import mongoose from 'mongoose';

const sendMessage = async (req: Request, res: Response) => {
    try {
        const { senderId, receiverId, content } = req.body;
        if (!senderId || !receiverId || !content) {
            res.status(400).json({ success: false, message: "SenderId, receiverId and content are required" });
            return;
        }
        const message = await Message.create({ senderId, receiverId, content });
        res.status(201).json({ success: true, messageId: message._id, data: message }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const getAllUserMessages = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query; 

        if (!userId) {
            res.status(400).json({ success: false, message: "UserId is required" });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(userId as string)) {
            res.status(400).json({ success: false, message: "Invalid userId" });
            return;
        }

        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { receiverId: userId },
            ],
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
const getMessagesBetweenUsers = async (req: Request, res: Response) => {
    try {
        const { senderId, receiverId } = req.query;

        if (!senderId || !receiverId) {
            res.status(400).json({ success: false, message: "SenderId and receiverId are required" });
            return;
        }
        if (!mongoose.Types.ObjectId.isValid(senderId as string) || !mongoose.Types.ObjectId.isValid(receiverId as string)) {
            res.status(400).json({ success: false, message: "Invalid senderId or receiverId" });
            return;
        }

        const messages = await Message.find({
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
const messageRead = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.body;

        if (!messageId) {
            res.status(400).json({ success: false, message: "MessageId is required" });
            return;
        }
        const message = await Message.findById(messageId);

        if (!message) {
            res.status(404).json({ success: false, message: "Message not found" });
            return;
        }

        message.messageRead = true;
        await message.save();

        res.status(200).json({ success: true, data: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
const deleteMessage = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.body;
        if (!messageId) {
            res.status(400).json({ success: false, message: "MessageId is required" });
            return;
        }
        
        const message = await Message.findByIdAndDelete(messageId);
        if (!message) {
            res.status(404).json({ success: false, message: "Message not found" });
            return;
        }
        res.status(201).json({ success: true, message: "Message deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
const messageController = {
    sendMessage,
    getAllUserMessages,
    getMessagesBetweenUsers,
    messageRead,
    deleteMessage
}
export default messageController;
