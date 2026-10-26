import express from 'express';
import studentLessonSessionsController from './StudentLessonSessions.controller.js';

const router = express.Router();

router.post('/', studentLessonSessionsController.create);
router.get('/', studentLessonSessionsController.getAll);
router.get('/:id', studentLessonSessionsController.getById);
router.put('/:id', studentLessonSessionsController.update);
router.post('/:id/checkpoint', studentLessonSessionsController.logCheckpoint);
router.post('/:id/dialogue', studentLessonSessionsController.logDialogue);
router.delete('/:id', studentLessonSessionsController.delete);

export default router;
