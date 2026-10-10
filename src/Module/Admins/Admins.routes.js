import express from 'express';
import adminsController from './Admins.controller.js';
import { validate } from '../../Middleware/validation.middleware.js';
import { createAdminSchema, updateAdminSchema } from '../../Validation/Admin.validation.js';

const router = express.Router();

router.post('/', validate(createAdminSchema), adminsController.create);
router.get('/', adminsController.getAll);
router.get('/:id', adminsController.getById);
router.put('/:id', validate(updateAdminSchema), adminsController.update);
router.delete('/:id', adminsController.delete);

export default router;
