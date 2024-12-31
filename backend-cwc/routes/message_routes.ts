import express from 'express';
import messageController from '../controllers/messages_controller';
import { authMiddleware } from '../controllers/auth_controller';
import { Router } from 'express';

const router = express.Router();

router.post('/SendMessage', authMiddleware, messageController.sendMessage);

router.get('/GetAllMessages', authMiddleware, messageController.getAllUserMessages);

router.get('/GetMessagesBetweenUsers', authMiddleware, messageController.getMessagesBetweenUsers);

router.put('/MarkMessageAsRead', authMiddleware, messageController.messageRead);

router.delete('/DeleteMessage', authMiddleware, messageController.deleteMessage);

export default router;