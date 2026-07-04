import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getClasses, getAttendance } from '../services/api.js';
import { formatDate } from '../utils/constants.js';

function pad(n) { return String(n).padStart(2, '0'); }

export default function CalendarView() {
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    Promise.all([getClasses(), getAttendance()]).then(([sRes, aRes]) => {
      setSessions(sRes.data);
      setAttendance(aRes.data);
      setLoading(false);
    });
  }, []);

  const byDate = useMemo(() => {
    const map = {};
    for (const s of sessions) {
      if (!map[s.date]) map[s.date] = { happened: 0, cancelled: 0, attended: 0, absent: 0, notMarked: 0, sessions: [] };
      map[s.date].sessions.push(s);
      if (s.status === 'Cancelled') map[s.date].cancelled++;
      else map[s.date].happened++;
    }
    for (const a of attendance) {
      if (!map[a.date]) continue;
      if (a.attendanceStatus === 'Attended') map[a.date].attended++;
      else if (a.attendanceStatus === 'Absent') map[a.date].absent++;
      else map[a.date].notMarked++;
    }
    return map;
  }, [sessions, attendance]);

  if (loading) return <Loader text="Loading calendar..." />;

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const selectedInfo = selectedDate ? byDate[selectedDate] : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Calendar View</h1>
          <div className="page-subtitle">Date-wise view of your classes and attendance</div>
        </div>
        <div className="tag-row">
          <button className="btn btn-secondary" onClick={() => setCursor(new Date(year, month - 1, 1))}>◀ Prev</button>
          <span style={{ alignSelf: 'center', fontWeight: 600 }}>{monthLabel}</span>
          <button className="btn btn-secondary" onClick={() => setCursor(new Date(year, month + 1, 1))}>Next ▶</button>
        </div>
      </div>

      <div className="panel">
        <div className="calendar-grid" style={{ marginBottom: 8 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
            <div key={d} className="text-muted" style={{ fontWeight: 600, fontSize: 12, textAlign: 'center' }}>{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {cells.map((d, idx) => {
            if (!d) return <div key={idx} className="calendar-cell empty" />;
            const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
            const info = byDate[dateStr];
            return (
              <div key={idx} className="calendar-cell" onClick={() => setSelectedDate(dateStr)}>
                <div className="calendar-date">{d}</div>
                {info && (
                  <div className="calendar-mini-stats">
                    {info.attended > 0 && <span className="badge badge-green" style={{ fontSize: 10 }}>{info.attended} A</span>}
                    {info.absent > 0 && <span className="badge badge-red" style={{ fontSize: 10 }}>{info.absent} Ab</span>}
                    {info.cancelled > 0 && <span className="badge badge-gray" style={{ fontSize: 10 }}>{info.cancelled} C</span>}
                    {info.notMarked > 0 && <span className="badge badge-orange" style={{ fontSize: 10 }}>{info.notMarked} NM</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="panel">
          <div className="panel-title">Classes on {formatDate(selectedDate)}</div>
          {!selectedInfo || selectedInfo.sessions.length === 0 ? (
            <EmptyState message="No classes recorded on this date." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Hour</th>
                    <th>Topic</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInfo.sessions.map((s) => (
                    <tr key={s._id}>
                      <td>{s.course?.courseName} <span className="text-muted">({s.course?.courseCode})</span></td>
                      <td>{s.hourNumber}</td>
                      <td>{s.topic || '—'}</td>
                      <td><span className={`badge ${s.status === 'Cancelled' ? 'badge-red' : 'badge-green'}`}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
