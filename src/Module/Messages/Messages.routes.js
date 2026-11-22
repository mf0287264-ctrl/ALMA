import express from 'express';
import messagesController from './Messages.controller.js';
import { authenticate } from '../../Middleware/auth.middleware.js';

const router = express.Router();

router.get('/threads', authenticate, messagesController.getThreads);
router.get('/:partnerId', authenticate, messagesController.getConversation);
router.post('/:partnerId', authenticate, messagesController.sendMessage);

export default router;
