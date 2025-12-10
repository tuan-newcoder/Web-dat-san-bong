const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldsController');

router.get('/shift/search', fieldController.getShiftByDate);

router.get('/', fieldController.getFields);
router.get('/:id', fieldController.getFieldDetails);

module.exports = router;