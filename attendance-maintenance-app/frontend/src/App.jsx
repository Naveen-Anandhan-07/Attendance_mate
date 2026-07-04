import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Courses from './pages/Courses.jsx';
import CourseForm from './pages/CourseForm.jsx';
import Timetable from './pages/Timetable.jsx';
import DailyClasses from './pages/DailyClasses.jsx';
import MarkAttendance from './pages/MarkAttendance.jsx';
import AttendanceSummary from './pages/AttendanceSummary.jsx';
import BunkPlanner from './pages/BunkPlanner.jsx';
import GpaCalculator from './pages/GpaCalculator.jsx';
import CalendarView from './pages/CalendarView.jsx';
import DaySearch from './pages/DaySearch.jsx';
import ExportBackup from './pages/ExportBackup.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <div className="mobile-brand">Attendance Mate</div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/add" element={<CourseForm />} />
          <Route path="/courses/edit/:id" element={<CourseForm />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/classes" element={<DailyClasses />} />
          <Route path="/attendance" element={<MarkAttendance />} />
          <Route path="/summary" element={<AttendanceSummary />} />
          <Route path="/bunk-planner" element={<BunkPlanner />} />
          <Route path="/gpa" element={<GpaCalculator />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/day-search" element={<DaySearch />} />
          <Route path="/export" element={<ExportBackup />} />
        </Routes>
      </main>
    </div>
  );
}
