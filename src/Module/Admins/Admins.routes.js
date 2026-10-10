const express = require('express');
const router = express.Router();
const adminsController = require('./Admins.controller');

router.post('/', adminsController.create);
router.get('/', adminsController.getAll);
router.get('/:id', adminsController.getById);
router.put('/:id', adminsController.update);
router.delete('/:id', adminsController.delete);

module.exports = router;
