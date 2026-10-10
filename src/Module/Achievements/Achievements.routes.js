const express = require('express');
const router = express.Router();
const achievementsController = require('./Achievements.controller');

router.post('/', achievementsController.create);
router.get('/', achievementsController.getAll);
router.get('/:id', achievementsController.getById);
router.put('/:id', achievementsController.update);
router.delete('/:id', achievementsController.delete);

module.exports = router;
