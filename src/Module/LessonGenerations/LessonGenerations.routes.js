import express from 'express';
import lessonGenerationsController from './LessonGenerations.controller.js';

const router = express.Router();

router.post('/', lessonGenerationsController.create);
router.get('/', lessonGenerationsController.getAll);
router.get('/:id', lessonGenerationsController.getById);
router.put('/:id', lessonGenerationsController.update);
router.delete('/:id', lessonGenerationsController.delete);

export default router;
