import express from 'express';
import lessonsController from './Lessons.controller.js';
import achievementsController from '../Achievements/Achievements.controller.js';
import { authenticate, optionalAuthenticate } from '../../Middleware/auth.middleware.js';

const router = express.Router();

router.get('/my-lessons', optionalAuthenticate, lessonsController.getMyLessons);
router.post('/:id/complete', authenticate, achievementsController.completeLesson);
router.post('/', lessonsController.create);
router.get('/', lessonsController.getAll);
router.get('/:id', lessonsController.getById);
router.put('/:id', lessonsController.update);
router.delete('/:id', lessonsController.delete);

export default router;
