const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gpaController');

router.post('/save', ctrl.saveGrade);
router.get('/', ctrl.getGpaRecords);
router.post('/calculate', ctrl.calculateGpa);
router.delete('/reset', ctrl.resetGrades);

module.exports = router;
