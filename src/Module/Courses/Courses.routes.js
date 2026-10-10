import express from 'express';
import coursesController from './Courses.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { createCourseSchema, updateCourseSchema } from '../../Validation/Course.validation.js';

const router = express.Router();

router.post('/', validate(createCourseSchema), coursesController.create);
router.get('/', coursesController.getAll);
router.get('/:id', coursesController.getById);
router.put('/:id', validate(updateCourseSchema), coursesController.update);
router.delete('/:id', coursesController.delete);

export default router;
