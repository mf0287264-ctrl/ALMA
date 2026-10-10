const express = require('express');
const router = express.Router();
const quizzesController = require('./Quizzes.controller');

router.post('/', quizzesController.create);
router.get('/', quizzesController.getAll);
router.get('/:id', quizzesController.getById);
router.put('/:id', quizzesController.update);
router.delete('/:id', quizzesController.delete);

module.exports = router;
