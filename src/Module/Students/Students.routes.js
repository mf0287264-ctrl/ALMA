const express = require('express');
const router = express.Router();
const studentsController = require('./Students.controller');

router.post('/', studentsController.create);
router.get('/', studentsController.getAll);
router.get('/:id', studentsController.getById);
router.put('/:id', studentsController.update);
router.delete('/:id', studentsController.delete);

module.exports = router;
