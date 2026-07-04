const mongoose = require('mongoose');

const classSessionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // stored as YYYY-MM-DD
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    hourNumber: { type: Number, required: true, min: 1, max: 9 },
    topic: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['Happened', 'Cancelled'], default: 'Happened' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClassSession', classSessionSchema);
