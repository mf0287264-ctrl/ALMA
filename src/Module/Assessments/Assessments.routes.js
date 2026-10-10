import express from 'express';
import assessmentsController from './Assessments.controller.js';

const router = express.Router();

router.post('/', assessmentsController.create);
router.get('/', assessmentsController.getAll);
router.get('/:id', assessmentsController.getById);
router.put('/:id', assessmentsController.update);
router.delete('/:id', assessmentsController.delete);

export default router;
