const ClassSession = require('../models/ClassSession');
const Attendance = require('../models/Attendance');

exports.createClass = async (req, res, next) => {
  try {
    const session = await ClassSession.create(req.body);
    await Attendance.create({
      classSession: session._id,
      course: session.course,
      attendanceStatus: 'Not Marked',
      date: session.date
    });
    const populated = await session.populate('course');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.getClasses = async (req, res, next) => {
  try {
    const sessions = await ClassSession.find().populate('course').sort({ date: -1, hourNumber: 1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

exports.getTodayClasses = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const sessions = await ClassSession.find({ date: today }).populate('course').sort({ hourNumber: 1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

exports.getClassesByDate = async (req, res, next) => {
  try {
    const sessions = await ClassSession.find({ date: req.params.date })
      .populate('course')
      .sort({ hourNumber: 1 });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

exports.updateClass = async (req, res, next) => {
  try {
    const session = await ClassSession.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('course');
    if (!session) return res.status(404).json({ message: 'Class session not found' });
    await Attendance.findOneAndUpdate(
      { classSession: session._id },
      {
        $set: { course: session.course, date: session.date },
        $setOnInsert: { classSession: session._id, attendanceStatus: 'Not Marked' }
      },
      { upsert: true }
    );
    res.json(session);
  } catch (err) {
    next(err);
  }
};

exports.deleteClass = async (req, res, next) => {
  try {
    const session = await ClassSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Class session not found' });
    await Attendance.deleteMany({ classSession: session._id });
    res.json({ message: 'Class session deleted' });
  } catch (err) {
    next(err);
  }
};
