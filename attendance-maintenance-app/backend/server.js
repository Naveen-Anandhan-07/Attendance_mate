require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const courseRoutes = require('./routes/courses');
const timetableRoutes = require('./routes/timetable');
const classRoutes = require('./routes/classes');
const attendanceRoutes = require('./routes/attendance');
const gpaRoutes = require('./routes/gpa');
const exportRoutes = require('./routes/export');
const backupRoutes = require('./routes/backup');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Attendance & GPA Tracker API is running' });
});

app.use('/api/courses', courseRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/gpa', gpaRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/backup', backupRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
