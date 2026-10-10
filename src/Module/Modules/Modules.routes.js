import express from 'express';
import modulesController from './Modules.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { createModuleSchema, updateModuleSchema } from '../../Validation/Module.validation.js';

const router = express.Router();

router.post('/', validate(createModuleSchema), modulesController.create);
router.get('/', modulesController.getAll);
router.get('/:id', modulesController.getById);
router.put('/:id', validate(updateModuleSchema), modulesController.update);
router.delete('/:id', modulesController.delete);

export default router;
