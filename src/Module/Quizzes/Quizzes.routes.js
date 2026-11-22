import express from 'express';
import quizzesController from './Quizzes.controller.js';
import { authenticate, optionalAuthenticate } from '../../Middleware/auth.middleware.js';

const router = express.Router();

router.post('/', quizzesController.create);
router.get('/', optionalAuthenticate, quizzesController.getAll);
router.post('/:id/attempt', authenticate, quizzesController.recordAttempt);
router.get('/:id/my-attempt', authenticate, quizzesController.getMyAttempt);
router.get('/:id', optionalAuthenticate, quizzesController.getById);
router.put('/:id', quizzesController.update);
router.delete('/:id', quizzesController.delete);

export default router;
