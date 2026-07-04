const Timetable = require('../models/Timetable');
const ClassSession = require('../models/ClassSession');
const Attendance = require('../models/Attendance');

exports.createEntry = async (req, res, next) => {
  try {
    const entry = await Timetable.create(req.body);
    const populated = await entry.populate('course');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.getTimetable = async (req, res, next) => {
  try {
    const entries = await Timetable.find().populate('course').sort({ dayOfWeek: 1, hourNumber: 1 });
    res.json(entries);
  } catch (err) {
    next(err);
  }
};

exports.updateEntry = async (req, res, next) => {
  try {
    const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('course');
    if (!entry) return res.status(404).json({ message: 'Timetable entry not found' });
    res.json(entry);
  } catch (err) {
    next(err);
  }
};

exports.deleteEntry = async (req, res, next) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Timetable entry not found' });
    res.json({ message: 'Timetable entry deleted' });
  } catch (err) {
    next(err);
  }
};

// Generate classes for a given date (defaults to today) based on the timetable's day of week
exports.generateToday = async (req, res, next) => {
  try {
    const dateStr = req.body.date || new Date().toISOString().slice(0, 10);
    const dayOfWeek = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });

    const entries = await Timetable.find({ dayOfWeek });
    if (entries.length === 0) {
      return res.json({ message: `No timetable entries for ${dayOfWeek}`, created: [] });
    }

    const created = [];
    for (const entry of entries) {
      const exists = await ClassSession.findOne({
        date: dateStr,
        course: entry.course,
        hourNumber: entry.hourNumber
      });
      if (exists) continue;

      const session = await ClassSession.create({
        date: dateStr,
        course: entry.course,
        hourNumber: entry.hourNumber,
        topic: entry.note || '',
        status: 'Happened'
      });
      await Attendance.create({
        classSession: session._id,
        course: entry.course,
        attendanceStatus: 'Not Marked',
        date: dateStr
      });
      created.push(session);
    }

    res.json({ message: `Generated ${created.length} class(es) for ${dayOfWeek} (${dateStr})`, created });
  } catch (err) {
    next(err);
  }
};
