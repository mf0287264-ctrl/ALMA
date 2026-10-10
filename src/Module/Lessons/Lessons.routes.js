import express from 'express';
import lessonsController from './Lessons.controller.js';

const router = express.Router();

router.post('/', lessonsController.create);
router.get('/', lessonsController.getAll);
router.get('/:id', lessonsController.getById);
router.put('/:id', lessonsController.update);
router.delete('/:id', lessonsController.delete);

export default router;
