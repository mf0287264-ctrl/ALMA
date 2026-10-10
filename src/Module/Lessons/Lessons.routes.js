const express = require('express');
const router = express.Router();
const lessonsController = require('./Lessons.controller');

router.post('/', lessonsController.create);
router.get('/', lessonsController.getAll);
router.get('/:id', lessonsController.getById);
router.put('/:id', lessonsController.update);
router.delete('/:id', lessonsController.delete);

module.exports = router;
