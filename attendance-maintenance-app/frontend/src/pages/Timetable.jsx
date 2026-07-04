import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useToast } from '../components/Toast.jsx';
import { DAYS_OF_WEEK, HOURS } from '../utils/constants.js';
import {
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getCourses
} from '../services/api.js';

const emptyForm = { dayOfWeek: 'Monday', hourNumber: 1, course: '', note: '' };

export default function Timetable() {
  const [entries, setEntries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [ttRes, courseRes] = await Promise.all([getTimetable(), getCourses()]);
      setEntries(ttRes.data);
      setCourses(courseRes.data);
      if (courseRes.data.length > 0 && !form.course) {
        setForm((f) => ({ ...f, course: courseRes.data[0]._id }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.course) {
      showToast('Please add a course first', 'error');
      return;
    }
    try {
      const payload = { ...form, hourNumber: Number(form.hourNumber) };
      if (editingId) {
        await updateTimetableEntry(editingId, payload);
        showToast('Timetable entry updated');
      } else {
        await createTimetableEntry(payload);
        showToast('Timetable entry added');
      }
      setForm({ ...emptyForm, course: courses[0]?._id || '' });
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save entry', 'error');
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setForm({
      dayOfWeek: entry.dayOfWeek,
      hourNumber: entry.hourNumber,
      course: entry.course?._id || '',
      note: entry.note || ''
    });
  };

  const handleDelete = async () => {
    await deleteTimetableEntry(toDelete._id);
    showToast('Timetable entry deleted');
    setToDelete(null);
    load();
  };

  if (loading) return <Loader text="Loading timetable..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Weekly Timetable</h1>
          <div className="page-subtitle">Set up your recurring weekly schedule once</div>
        </div>
      </div>

      {courses.length === 0 && (
        <EmptyState message="Add a course first before creating your timetable." />
      )}

      {courses.length > 0 && (
        <div className="panel">
          <div className="panel-title">{editingId ? 'Edit Slot' : 'Add Timetable Slot'}</div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Day of Week</label>
              <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange}>
                {DAYS_OF_WEEK.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Hour Number</label>
              <select name="hourNumber" value={form.hourNumber} onChange={handleChange}>
                {HOURS.map((h) => <option key={h} value={h}>{h}{h === 1 ? 'st' : h === 2 ? 'nd' : h === 3 ? 'rd' : 'th'} Hour</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Course</label>
              <select name="course" value={form.course} onChange={handleChange}>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.courseName} ({c.courseCode})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Note (optional)</label>
              <input name="note" value={form.note} onChange={handleChange} placeholder="Lab / Tutorial etc." />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Slot' : 'Add Slot'}</button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState message="No timetable entries yet. Add your first slot above." />
      ) : (
        <div className="timetable-grid">
          {DAYS_OF_WEEK.map((day) => {
            const dayEntries = entries.filter((e) => e.dayOfWeek === day).sort((a, b) => a.hourNumber - b.hourNumber);
            if (dayEntries.length === 0) return null;
            return (
              <div key={day} className="day-column">
                <h4>{day}</h4>
                {dayEntries.map((entry) => (
                  <div key={entry._id} className="tt-slot">
                    <span>
                      <strong>{entry.hourNumber}h</strong> — {entry.course?.courseCode || 'N/A'}
                    </span>
                    <span className="tag-row">
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(entry)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setToDelete(entry)}>×</button>
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete Timetable Entry"
        message="Are you sure you want to delete this timetable slot?"
        confirmLabel="Delete"
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
