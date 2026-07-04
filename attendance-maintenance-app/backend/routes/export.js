const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/exportController');

router.get('/my-attendance', ctrl.exportMyAttendance);
router.get('/classes-happened', ctrl.exportClassesHappened);
router.get('/attendance-summary', ctrl.exportAttendanceSummary);
router.get('/gpa-report', ctrl.exportGpaReport);

module.exports = router;
