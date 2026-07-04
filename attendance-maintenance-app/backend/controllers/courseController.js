const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const ClassSession = require('../models/ClassSession');
const Attendance = require('../models/Attendance');
const Gpa = require('../models/Gpa');

exports.createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    // auto create a Gpa placeholder for this course
    await Gpa.create({ course: course._id, credits: course.credits, grade: '', gradePoint: 0 });
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    next(err);
  }
};

exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    // keep Gpa credits in sync
    await Gpa.findOneAndUpdate({ course: course._id }, { credits: course.credits });
    res.json(course);
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sessions = await ClassSession.find({ course: course._id });
    const sessionIds = sessions.map((s) => s._id);

    await Attendance.deleteMany({ classSession: { $in: sessionIds } });
    await ClassSession.deleteMany({ course: course._id });
    await Timetable.deleteMany({ course: course._id });
    await Gpa.deleteMany({ course: course._id });
    await course.deleteOne();

    res.json({ message: 'Course and related records deleted' });
  } catch (err) {
    next(err);
  }
};
