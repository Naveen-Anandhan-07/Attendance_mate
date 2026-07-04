import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  HOURS,
  todayStr,
  formatDate,
  formatHour,
  getWeekRange,
  shiftDate,
  isDateInRange,
  formatWeekRange
} from '../utils/constants.js';
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getCourses,
  generateTodayClasses
} from '../services/api.js';

const emptyForm = { date: todayStr(), course: '', hourNumber: 1, topic: '', status: 'Happened' };

export default function DailyClasses() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [genDate, setGenDate] = useState(todayStr());
  const [weekAnchor, setWeekAnchor] = useState(todayStr());
  const { showToast } = useToast();

  useEffect(() => {
    load();
  }, []);

  const weekRange = useMemo(() => getWeekRange(weekAnchor), [weekAnchor]);

  const load = async () => {
    setLoading(true);
    try {
      const [classRes, courseRes] = await Promise.all([getClasses(), getCourses()]);
      setSessions(classRes.data);
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
        await updateClass(editingId, payload);
        showToast('Class session updated');
      } else {
        await createClass(payload);
        showToast('Class session added');
      }
      setForm({ ...emptyForm, course: courses[0]?._id || '' });
      setEditingId(null);
      setWeekAnchor(payload.date);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save class', 'error');
    }
  };

  const handleEdit = (s) => {
    setEditingId(s._id);
    setForm({
      date: s.date,
      course: s.course?._id || '',
      hourNumber: s.hourNumber,
      topic: s.topic || '',
      status: s.status
    });
  };

  const handleDelete = async () => {
    await deleteClass(toDelete._id);
    showToast('Class session deleted');
    setToDelete(null);
    load();
  };

  const toggleCancel = async (s) => {
    await updateClass(s._id, { status: s.status === 'Cancelled' ? 'Happened' : 'Cancelled' });
    load();
  };

  const handleGenerate = async () => {
    const res = await generateTodayClasses(genDate);
    setWeekAnchor(genDate);
    showToast(res.data.message);
    load();
  };

  const weeklySessions = useMemo(
    () => sessions.filter((session) => isDateInRange(session.date, weekRange.start, weekRange.end)),
    [sessions, weekRange]
  );

  const groupedSessions = useMemo(() => {
    const groups = weeklySessions.reduce((acc, session) => {
      if (!acc[session.date]) acc[session.date] = [];
      acc[session.date].push(session);
      return acc;
    }, {});

    return Object.entries(groups)
      .map(([date, items]) => {
        const sortedItems = [...items].sort((a, b) => a.hourNumber - b.hourNumber);
        return {
          date,
          items: sortedItems,
          happened: sortedItems.filter((s) => s.status === 'Happened').length,
          cancelled: sortedItems.filter((s) => s.status === 'Cancelled').length
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [weeklySessions]);

  if (loading) return <Loader text="Loading classes..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Weekly class log</div>
          <h1>Daily Classes</h1>
          <div className="page-subtitle">Only the selected week is shown here, so the page stays clean. Use Day Search for a single date.</div>
        </div>
        <div className="week-switcher">
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekAnchor(shiftDate(weekRange.start, -7))}>← Previous</button>
          <div>
            <span>This week</span>
            <strong>{formatWeekRange(weekRange.start, weekRange.end)}</strong>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekAnchor(shiftDate(weekRange.start, 7))}>Next →</button>
        </div>
      </div>

      <div className="helper-step-strip">
        <div><strong>1</strong><span>Pick date</span></div>
        <div><strong>2</strong><span>Generate from timetable</span></div>
        <div><strong>3</strong><span>Check this week only</span></div>
      </div>

      <div className="panel action-panel">
        <div>
          <div className="panel-title">Generate From Timetable</div>
          <p className="panel-help">Use this when your regular timetable is already saved. It avoids re-entering every class manually.</p>
        </div>
        <div className="tag-row" style={{ alignItems: 'flex-end' }}>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={genDate} onChange={(e) => setGenDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleGenerate}>Generate Classes</button>
        </div>
      </div>

      {courses.length === 0 ? (
        <EmptyState message="Add a course first before recording classes." />
      ) : (
        <div className="panel">
          <div className="panel-title">{editingId ? 'Edit Class Session' : 'Add Class Manually'}</div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Course</label>
              <select name="course" value={form.course} onChange={handleChange}>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.courseName} ({c.courseCode})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Hour Number</label>
              <select name="hourNumber" value={form.hourNumber} onChange={handleChange}>
                {HOURS.map((h) => <option key={h} value={h}>{h}{h === 1 ? 'st' : h === 2 ? 'nd' : h === 3 ? 'rd' : 'th'} Hour</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Happened">Happened</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Topic / Remarks</label>
              <input name="topic" value={form.topic} onChange={handleChange} placeholder="Normalization, Joins..." />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add Class'}</button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {weeklySessions.length === 0 ? (
        <EmptyState message={`No class sessions recorded for ${formatWeekRange(weekRange.start, weekRange.end)}.`} />
      ) : (
        <div className="panel">
          <div className="panel-title">
            <span>Class Sessions This Week</span>
            <span className="chip">{weeklySessions.length} shown · {sessions.length} total saved</span>
          </div>
          <p className="panel-help">Classes are grouped date-wise. Older and future records are still saved, but hidden from this weekly view.</p>

          <div className="class-day-list">
            {groupedSessions.map((group) => (
              <div className="class-day-group" key={group.date}>
                <div className="class-day-header">
                  <div>
                    <h3>{formatDate(group.date)}</h3>
                    <span>{group.items.length} class(es) recorded</span>
                  </div>
                  <div className="class-day-metrics">
                    <span className="badge badge-green">{group.happened} happened</span>
                    <span className="badge badge-red">{group.cancelled} cancelled</span>
                  </div>
                </div>

                <div className="session-card-list">
                  {group.items.map((s) => (
                    <div className="session-card" key={s._id}>
                      <div className="session-hour">{formatHour(s.hourNumber)}</div>
                      <div className="session-main">
                        <strong>{s.course?.courseName || 'N/A'}</strong>
                        <span>{s.course?.courseCode || 'No code'} · {s.topic || 'No topic added'}</span>
                      </div>
                      <span className={`badge ${s.status === 'Cancelled' ? 'badge-red' : 'badge-green'}`}>{s.status}</span>
                      <div className="session-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => toggleCancel(s)}>
                          {s.status === 'Cancelled' ? 'Mark Happened' : 'Cancel'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setToDelete(s)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="Delete Class Session"
        message="Are you sure you want to delete this class session and its attendance record?"
        confirmLabel="Delete"
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
