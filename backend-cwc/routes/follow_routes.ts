import express from 'express';
import { followController } from '../controllers/follow_controller';
import { authMiddleware } from '../controllers/auth_controller';

const router = express.Router();

router.post('/follow', authMiddleware, followController.follow);

router.post('/unfollow', authMiddleware, followController.unfollow);

export default router;