import express from 'express';
import teachersController from './Teachers.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { createTeacherSchema, updateTeacherSchema } from '../../Validation/Teacher.validation.js';

const router = express.Router();

router.post('/', validate(createTeacherSchema), teachersController.create);
router.get('/', teachersController.getAll);
router.get('/:id', teachersController.getById);
router.put('/:id', validate(updateTeacherSchema), teachersController.update);
router.delete('/:id', teachersController.delete);

export default router;
