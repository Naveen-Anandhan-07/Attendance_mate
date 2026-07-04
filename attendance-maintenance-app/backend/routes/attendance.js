const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');

router.post('/mark', ctrl.markAttendance);
router.post('/bulk-mark', ctrl.bulkMark);
router.get('/summary', ctrl.getSummary);
router.get('/bunk-planner', ctrl.getBunkPlanner);
router.get('/date/:date', ctrl.getAttendanceByDate);
router.get('/course/:courseId', ctrl.getCourseAttendance);
router.get('/', ctrl.getAttendance);
router.put('/:id', ctrl.updateAttendance);

module.exports = router;
