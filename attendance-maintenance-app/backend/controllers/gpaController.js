const Gpa = require('../models/Gpa');
const Course = require('../models/Course');
const { GRADE_POINTS, round2 } = require('../utils/calc');

exports.saveGrade = async (req, res, next) => {
  try {
    const { courseId, grade } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const gradePoint = grade ? GRADE_POINTS[grade] ?? 0 : 0;

    const record = await Gpa.findOneAndUpdate(
      { course: courseId },
      { credits: course.credits, grade, gradePoint },
      { new: true, upsert: true }
    ).populate('course');

    res.json(record);
  } catch (err) {
    next(err);
  }
};

exports.getGpaRecords = async (req, res, next) => {
  try {
    const records = await Gpa.find().populate('course').sort({ createdAt: 1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.calculateGpa = async (req, res, next) => {
  try {
    const records = await Gpa.find().populate('course');
    let totalCredits = 0;
    let weightedSum = 0;

    const details = records.map((r) => {
      const credits = r.course ? r.course.credits : r.credits;
      const gradePoint = r.grade ? GRADE_POINTS[r.grade] ?? 0 : 0;
      if (r.grade) {
        totalCredits += credits;
        weightedSum += credits * gradePoint;
      }
      return {
        course: r.course,
        credits,
        grade: r.grade,
        gradePoint,
        creditPoints: round2(credits * gradePoint)
      };
    });

    const gpa = totalCredits > 0 ? round2(weightedSum / totalCredits) : 0;

    res.json({ details, totalCredits, gpa });
  } catch (err) {
    next(err);
  }
};

exports.resetGrades = async (req, res, next) => {
  try {
    await Gpa.updateMany({}, { grade: '', gradePoint: 0 });
    res.json({ message: 'All grades reset' });
  } catch (err) {
    next(err);
  }
};
