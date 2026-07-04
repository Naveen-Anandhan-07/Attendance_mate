import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

// Courses
export const getCourses = () => api.get('/courses');
export const getCourse = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// Timetable
export const getTimetable = () => api.get('/timetable');
export const createTimetableEntry = (data) => api.post('/timetable', data);
export const updateTimetableEntry = (id, data) => api.put(`/timetable/${id}`, data);
export const deleteTimetableEntry = (id) => api.delete(`/timetable/${id}`);
export const generateTodayClasses = (date) => api.post('/timetable/generate-today', { date });

// Classes
export const getClasses = () => api.get('/classes');
export const getTodayClasses = () => api.get('/classes/today');
export const getClassesByDate = (date) => api.get(`/classes/date/${date}`);
export const createClass = (data) => api.post('/classes', data);
export const updateClass = (id, data) => api.put(`/classes/${id}`, data);
export const deleteClass = (id) => api.delete(`/classes/${id}`);

// Attendance
export const markAttendance = (classSessionId, attendanceStatus) =>
  api.post('/attendance/mark', { classSessionId, attendanceStatus });
export const bulkMarkAttendance = (classSessionIds, attendanceStatus) =>
  api.post('/attendance/bulk-mark', { classSessionIds, attendanceStatus });
export const getAttendance = () => api.get('/attendance');
export const getAttendanceByDate = (date) => api.get(`/attendance/date/${date}`);
export const getAttendanceSummary = () => api.get('/attendance/summary');
export const getBunkPlanner = () => api.get('/attendance/bunk-planner');
export const getCourseAttendance = (courseId) => api.get(`/attendance/course/${courseId}`);

// GPA
export const saveGrade = (courseId, grade) => api.post('/gpa/save', { courseId, grade });
export const getGpaRecords = () => api.get('/gpa');
export const calculateGpa = () => api.post('/gpa/calculate');
export const resetGrades = () => api.delete('/gpa/reset');

// Export (returns file download URLs)
export const exportUrls = {
  myAttendance: `${API_BASE}/export/my-attendance`,
  classesHappened: `${API_BASE}/export/classes-happened`,
  attendanceSummary: `${API_BASE}/export/attendance-summary`,
  gpaReport: `${API_BASE}/export/gpa-report`
};

// Backup
export const backupExportUrl = `${API_BASE}/backup/export`;
export const importBackup = (data) => api.post('/backup/import', data);
export const clearAllData = () => api.delete('/backup/clear-all');

export default api;
