const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    classSession: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSession', required: true, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    attendanceStatus: { type: String, enum: ['Attended', 'Absent', 'Not Marked'], default: 'Not Marked' },
    date: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
