const express = require('express');
const router = express.Router();
const coursesController = require('./Courses.controller');

router.post('/', coursesController.create);
router.get('/', coursesController.getAll);
router.get('/:id', coursesController.getById);
router.put('/:id', coursesController.update);
router.delete('/:id', coursesController.delete);

module.exports = router;
