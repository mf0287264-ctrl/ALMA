const express = require('express');
const router = express.Router();
const teachersController = require('./Teachers.controller');

router.post('/', teachersController.create);
router.get('/', teachersController.getAll);
router.get('/:id', teachersController.getById);
router.put('/:id', teachersController.update);
router.delete('/:id', teachersController.delete);

module.exports = router;
