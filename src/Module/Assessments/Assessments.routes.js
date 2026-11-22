import express from 'express';
import assessmentsController from './Assessments.controller.js';
import { authenticate, optionalAuthenticate } from '../../Middleware/auth.middleware.js';

const router = express.Router();

router.post('/', assessmentsController.create);
router.get('/', optionalAuthenticate, assessmentsController.getAll);
router.post('/:id/submit', authenticate, assessmentsController.submit);
router.get('/:id/my-result', authenticate, assessmentsController.getMyResult);
router.get('/:id', optionalAuthenticate, assessmentsController.getById);
router.put('/:id', assessmentsController.update);
router.delete('/:id', assessmentsController.delete);

export default router;
