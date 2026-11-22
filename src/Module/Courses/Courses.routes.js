import express from 'express';
import coursesController from './Courses.controller.js';
import achievementsController from '../Achievements/Achievements.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { authenticate, optionalAuthenticate } from '../../Middleware/auth.middleware.js';
import { createCourseSchema, updateCourseSchema } from '../../Validation/Course.validation.js';

const router = express.Router();

router.post('/', validate(createCourseSchema), coursesController.create);
router.get('/', optionalAuthenticate, coursesController.getAll);
router.get('/:id', optionalAuthenticate, coursesController.getById);
router.post('/:id/enroll', authenticate, coursesController.enroll);
router.post('/:id/complete', authenticate, achievementsController.triggerCourseCompletion);
router.get('/:id/enrollment', authenticate, coursesController.getEnrollmentStatus);
router.put('/:id', validate(updateCourseSchema), coursesController.update);
router.delete('/:id', coursesController.delete);

export default router;
