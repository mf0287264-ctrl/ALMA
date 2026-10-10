const express = require('express');
const router = express.Router();
const lessonGenerationsController = require('./LessonGenerations.controller');

router.post('/', lessonGenerationsController.create);
router.get('/', lessonGenerationsController.getAll);
router.get('/:id', lessonGenerationsController.getById);
router.put('/:id', lessonGenerationsController.update);
router.delete('/:id', lessonGenerationsController.delete);

module.exports = router;
