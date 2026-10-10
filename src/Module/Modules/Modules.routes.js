const express = require('express');
const router = express.Router();
const modulesController = require('./Modules.controller');

router.post('/', modulesController.create);
router.get('/', modulesController.getAll);
router.get('/:id', modulesController.getById);
router.put('/:id', modulesController.update);
router.delete('/:id', modulesController.delete);

module.exports = router;
