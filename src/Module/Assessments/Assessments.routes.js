const express = require('express');
const router = express.Router();
const assessmentsController = require('./Assessments.controller');

router.post('/', assessmentsController.create);
router.get('/', assessmentsController.getAll);
router.get('/:id', assessmentsController.getById);
router.put('/:id', assessmentsController.update);
router.delete('/:id', assessmentsController.delete);

module.exports = router;
