// Sample data seeder. Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const Course = require('./models/Course');
const Timetable = require('./models/Timetable');
const ClassSession = require('./models/ClassSession');
const Attendance = require('./models/Attendance');
const Gpa = require('./models/Gpa');

const run = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    Course.deleteMany({}),
    Timetable.deleteMany({}),
    ClassSession.deleteMany({}),
    Attendance.deleteMany({}),
    Gpa.deleteMany({})
  ]);

  console.log('Creating sample courses...');
  const courses = await Course.insertMany([
    { courseName: 'Database Management Systems', courseCode: 'CS3501', credits: 4, totalHours: 60, facultyName: 'Dr. Meera Krishnan', semester: 'V' },
    { courseName: 'Operating Systems', courseCode: 'CS3502', credits: 4, totalHours: 60, facultyName: 'Dr. Arun Prasad', semester: 'V' },
    { courseName: 'Computer Networks', courseCode: 'CS3503', credits: 3, totalHours: 45, facultyName: 'Prof. Lakshmi Narayan', semester: 'V' },
    { courseName: 'Software Engineering', courseCode: 'CS3504', credits: 3, totalHours: 45, facultyName: '', semester: 'V' }
  ]);

  await Promise.all(courses.map((c) => Gpa.create({ course: c._id, credits: c.credits, grade: '', gradePoint: 0 })));

  const [dbms, os, cn, se] = courses;

  console.log('Creating sample timetable...');
  await Timetable.insertMany([
    { dayOfWeek: 'Monday', hourNumber: 1, course: dbms._id, note: '' },
    { dayOfWeek: 'Monday', hourNumber: 2, course: os._id, note: '' },
    { dayOfWeek: 'Monday', hourNumber: 4, course: cn._id, note: '' },
    { dayOfWeek: 'Tuesday', hourNumber: 1, course: se._id, note: '' },
    { dayOfWeek: 'Tuesday', hourNumber: 3, course: dbms._id, note: '' },
    { dayOfWeek: 'Wednesday', hourNumber: 2, course: os._id, note: '' },
    { dayOfWeek: 'Wednesday', hourNumber: 5, course: cn._id, note: '' },
    { dayOfWeek: 'Thursday', hourNumber: 1, course: dbms._id, note: '' },
    { dayOfWeek: 'Thursday', hourNumber: 2, course: se._id, note: '' },
    { dayOfWeek: 'Friday', hourNumber: 3, course: os._id, note: '' }
  ]);

  console.log('Creating sample class sessions with attendance history...');
  const today = new Date();
  const sampleData = [
    { course: dbms, offsets: [-7, -6, -5, -4, -3, -2, -1], attended: [true, true, false, true, true, true, false] },
    { course: os, offsets: [-6, -5, -4, -3, -2, -1], attended: [true, false, false, true, false, false] },
    { course: cn, offsets: [-6, -3], attended: [true, true] },
    { course: se, offsets: [-5, -2], attended: [true, false] }
  ];

  for (const entry of sampleData) {
    for (let i = 0; i < entry.offsets.length; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + entry.offsets[i]);
      const dateStr = d.toISOString().slice(0, 10);

      const session = await ClassSession.create({
        date: dateStr,
        course: entry.course._id,
        hourNumber: 1,
        topic: 'Sample topic',
        status: 'Happened'
      });

      await Attendance.create({
        classSession: session._id,
        course: entry.course._id,
        attendanceStatus: entry.attended[i] ? 'Attended' : 'Absent',
        date: dateStr
      });
    }
  }

  console.log('Sample data seeded successfully!');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
