const Attendance = require('../models/Attendance');
const ClassSession = require('../models/ClassSession');
const Course = require('../models/Course');
const { calcPercentage, calcStatus, calcLeaveOrRecovery, calcBunkPlanner } = require('../utils/calc');

exports.markAttendance = async (req, res, next) => {
  try {
    const { classSessionId, attendanceStatus } = req.body;
    const record = await Attendance.findOneAndUpdate(
      { classSession: classSessionId },
      { attendanceStatus },
      { new: true }
    ).populate('course');
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
};

exports.bulkMark = async (req, res, next) => {
  try {
    const { classSessionIds, attendanceStatus } = req.body;
    if (!Array.isArray(classSessionIds) || classSessionIds.length === 0) {
      return res.status(400).json({ message: 'classSessionIds must be a non-empty array' });
    }
    await Attendance.updateMany(
      { classSession: { $in: classSessionIds } },
      { attendanceStatus }
    );
    const updated = await Attendance.find({ classSession: { $in: classSessionIds } }).populate('course');
    res.json({ message: `${updated.length} record(s) updated`, updated });
  } catch (err) {
    next(err);
  }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find().populate('course').populate('classSession').sort({ date: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};


exports.getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const sessions = await ClassSession.find({ date }).populate('course').sort({ hourNumber: 1 });
    const sessionIds = sessions.map((session) => session._id);
    const attendanceRecords = await Attendance.find({ classSession: { $in: sessionIds } });
    const attendanceBySession = new Map(attendanceRecords.map((record) => [String(record.classSession), record]));

    const rows = sessions.map((session) => {
      const record = attendanceBySession.get(String(session._id));
      return {
        _id: session._id,
        date: session.date,
        hourNumber: session.hourNumber,
        topic: session.topic,
        classStatus: session.status,
        course: session.course,
        attendanceRecordId: record?._id || null,
        attendanceStatus: session.status === 'Cancelled' ? 'Cancelled' : (record?.attendanceStatus || 'Not Marked')
      };
    });

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// course-wise attendance summary
exports.getSummary = async (req, res, next) => {
  try {
    const courses = await Course.find();
    const summary = [];

    for (const course of courses) {
      const happenedSessions = await ClassSession.find({ course: course._id, status: 'Happened' });
      const happenedIds = happenedSessions.map((s) => s._id);
      const attendedCount = await Attendance.countDocuments({
        classSession: { $in: happenedIds },
        attendanceStatus: 'Attended'
      });
      const totalHappened = happenedSessions.length;
      const missed = totalHappened - attendedCount;
      const percentage = calcPercentage(attendedCount, totalHappened);
      const status = calcStatus(percentage);
      const recovery = calcLeaveOrRecovery(attendedCount, totalHappened);

      summary.push({
        course: {
          _id: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          credits: course.credits
        },
        totalClassesHappened: totalHappened,
        classesAttended: attendedCount,
        classesMissed: missed < 0 ? 0 : missed,
        percentage,
        status,
        leaveOrRecovery: recovery
      });
    }

    res.json(summary);
  } catch (err) {
    next(err);
  }
};

exports.getCourseAttendance = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const records = await Attendance.find({ course: courseId }).populate('classSession').sort({ date: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

// Bunk planner: per-course "can I skip next class" style breakdown
exports.getBunkPlanner = async (req, res, next) => {
  try {
    const courses = await Course.find();
    const result = [];

    for (const course of courses) {
      const happenedSessions = await ClassSession.find({ course: course._id, status: 'Happened' });
      const happenedIds = happenedSessions.map((s) => s._id);
      const attendedCount = await Attendance.countDocuments({
        classSession: { $in: happenedIds },
        attendanceStatus: 'Attended'
      });
      const totalHappened = happenedSessions.length;
      const planner = calcBunkPlanner(attendedCount, totalHappened);

      result.push({
        course: {
          _id: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode
        },
        totalClassesHappened: totalHappened,
        classesAttended: attendedCount,
        ...planner
      });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('course');
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json(record);
  } catch (err) {
    next(err);
  }
};
