const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/classController');

router.get('/today', ctrl.getTodayClasses);
router.get('/date/:date', ctrl.getClassesByDate);
router.post('/', ctrl.createClass);
router.get('/', ctrl.getClasses);
router.put('/:id', ctrl.updateClass);
router.delete('/:id', ctrl.deleteClass);

module.exports = router;
