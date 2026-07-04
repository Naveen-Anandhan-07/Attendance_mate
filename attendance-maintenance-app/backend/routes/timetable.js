const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/timetableController');

router.post('/generate-today', ctrl.generateToday);
router.post('/', ctrl.createEntry);
router.get('/', ctrl.getTimetable);
router.put('/:id', ctrl.updateEntry);
router.delete('/:id', ctrl.deleteEntry);

module.exports = router;
