import express from 'express';
import achievementsController from './Achievements.controller.js';
import { authenticate, optionalAuthenticate } from '../../Middleware/auth.middleware.js';

const router = express.Router();

// Student-specific achievements
router.get('/me', authenticate, achievementsController.getMyAchievements);
router.post('/courses/:courseId/complete', authenticate, achievementsController.triggerCourseCompletion);
router.post('/lessons/:lessonId/complete', authenticate, achievementsController.completeLesson);

// Standard endpoints
router.get('/', optionalAuthenticate, achievementsController.getAll);
router.post('/', achievementsController.create);
router.get('/:id', achievementsController.getById);
router.put('/:id', achievementsController.update);
router.delete('/:id', achievementsController.delete);

export default router;
