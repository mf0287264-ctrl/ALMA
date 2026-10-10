import express from 'express';
import achievementsController from './Achievements.controller.js';

const router = express.Router();

router.post('/', achievementsController.create);
router.get('/', achievementsController.getAll);
router.get('/:id', achievementsController.getById);
router.put('/:id', achievementsController.update);
router.delete('/:id', achievementsController.delete);

export default router;
