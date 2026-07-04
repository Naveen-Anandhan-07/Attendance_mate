import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { getCourses, deleteCourse } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCourses();
      setCourses(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCourse(toDelete._id);
      showToast('Course deleted successfully');
      setToDelete(null);
      load();
    } catch (err) {
      showToast('Failed to delete course', 'error');
    }
  };

  if (loading) return <Loader text="Loading courses..." />;

  const totalCredits = courses.reduce((sum, c) => sum + Number(c.credits || 0), 0);
  const totalHours = courses.reduce((sum, c) => sum + Number(c.totalHours || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Semester setup</div>
          <h1>Courses</h1>
          <div className="page-subtitle">Add subjects once. Attendance, GPA, and exports will reuse this data.</div>
        </div>
        <Link to="/courses/add" className="btn btn-primary">+ Add Course</Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon="book"
          title="No courses added yet"
          message="Start by adding course name, code, credits, and planned hours. This makes GPA and attendance reports automatic."
          action={<Link to="/courses/add" className="btn btn-primary">Add your first course</Link>}
        />
      ) : (
        <>
          <div className="mini-summary-grid course-summary-strip">
            <div>
              <strong>{courses.length}</strong>
              <span>Courses</span>
            </div>
            <div>
              <strong>{totalCredits}</strong>
              <span>Total credits</span>
            </div>
            <div>
              <strong>{totalHours}</strong>
              <span>Planned hours</span>
            </div>
          </div>

          <div className="course-card-grid">
            {courses.map((c) => (
              <div key={c._id} className="course-card">
                <div className="course-card-top">
                  <div>
                    <span className="chip">{c.courseCode}</span>
                    <h3>{c.courseName}</h3>
                  </div>
                  <div className="credit-pill">{c.credits} cr</div>
                </div>

                <div className="course-info-grid">
                  <div>
                    <span>Total hours</span>
                    <strong>{c.totalHours || '—'}</strong>
                  </div>
                  <div>
                    <span>Semester</span>
                    <strong>{c.semester || '—'}</strong>
                  </div>
                  <div className="wide">
                    <span>Faculty</span>
                    <strong>{c.facultyName || 'Not added'}</strong>
                  </div>
                </div>

                <div className="course-card-actions">
                  <Link to={`/courses/edit/${c._id}`} className="btn btn-outline btn-sm">Edit</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => setToDelete(c)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete Course"
        message={`Delete "${toDelete?.courseName}"? This will also remove its timetable entries, class sessions, attendance records, and GPA entry.`}
        confirmLabel="Delete"
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
