const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const ClassSession = require('../models/ClassSession');
const Attendance = require('../models/Attendance');
const Gpa = require('../models/Gpa');

exports.exportBackup = async (req, res, next) => {
  try {
    const [courses, timetable, classSessions, attendance, gpa] = await Promise.all([
      Course.find(),
      Timetable.find(),
      ClassSession.find(),
      Attendance.find(),
      Gpa.find()
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      courses,
      timetable,
      classSessions,
      attendance,
      gpa
    };

    res.setHeader('Content-Disposition', 'attachment; filename="attendance_app_backup.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    next(err);
  }
};

exports.importBackup = async (req, res, next) => {
  try {
    const { courses = [], timetable = [], classSessions = [], attendance = [], gpa = [] } = req.body;

    await Promise.all([
      Course.deleteMany({}),
      Timetable.deleteMany({}),
      ClassSession.deleteMany({}),
      Attendance.deleteMany({}),
      Gpa.deleteMany({})
    ]);

    if (courses.length) await Course.insertMany(courses);
    if (timetable.length) await Timetable.insertMany(timetable);
    if (classSessions.length) await ClassSession.insertMany(classSessions);
    if (attendance.length) await Attendance.insertMany(attendance);
    if (gpa.length) await Gpa.insertMany(gpa);

    res.json({ message: 'Backup restored successfully' });
  } catch (err) {
    next(err);
  }
};

exports.clearAll = async (req, res, next) => {
  try {
    await Promise.all([
      Course.deleteMany({}),
      Timetable.deleteMany({}),
      ClassSession.deleteMany({}),
      Attendance.deleteMany({}),
      Gpa.deleteMany({})
    ]);
    res.json({ message: 'All data cleared' });
  } catch (err) {
    next(err);
  }
};
