import express from 'express';
import studentsController from './Students.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { createStudentSchema, updateStudentSchema } from '../../Validation/Student.validation.js';

const router = express.Router();

router.post('/', validate(createStudentSchema), studentsController.create);
router.get('/', studentsController.getAll);
router.get('/:id', studentsController.getById);
router.put('/:id', validate(updateStudentSchema), studentsController.update);
router.delete('/:id', studentsController.delete);

export default router;
