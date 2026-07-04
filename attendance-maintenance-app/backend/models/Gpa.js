const mongoose = require('mongoose');

const gpaSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, unique: true },
    credits: { type: Number, required: true },
    grade: { type: String, enum: ['O', 'S', 'A+', 'A', 'B+', 'B', 'C', 'F', ''], default: '' },
    gradePoint: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gpa', gpaSchema);
