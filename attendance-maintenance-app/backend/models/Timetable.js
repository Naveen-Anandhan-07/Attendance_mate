const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    hourNumber: { type: Number, required: true, min: 1, max: 9 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    note: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);
