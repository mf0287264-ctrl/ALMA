import express from 'express';
import quizzesController from './Quizzes.controller.js';

const router = express.Router();

router.post('/', quizzesController.create);
router.get('/', quizzesController.getAll);
router.get('/:id', quizzesController.getById);
router.put('/:id', quizzesController.update);
router.delete('/:id', quizzesController.delete);

export default router;
