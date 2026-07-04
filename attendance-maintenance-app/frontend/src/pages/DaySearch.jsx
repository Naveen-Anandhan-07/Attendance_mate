import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useToast } from '../components/Toast.jsx';
import { formatDate, formatHour, todayStr } from '../utils/constants.js';
import { getAttendanceByDate, markAttendance } from '../services/api.js';

function statusBadgeClass(status) {
  if (status === 'Attended') return 'badge-green';
  if (status === 'Absent') return 'badge-red';
  if (status === 'Cancelled') return 'badge-gray';
  return 'badge-orange';
}

export default function DaySearch() {
  const [date, setDate] = useState(todayStr());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const load = async (targetDate = date) => {
    setLoading(true);
    try {
      const res = await getAttendanceByDate(targetDate);
      setRecords(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(date);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(date);
  };

  const handleMark = async (classSessionId, status) => {
    await markAttendance(classSessionId, status);
    showToast(`Marked as ${status}`);
    load(date);
  };

  const happened = records.filter((r) => r.classStatus === 'Happened').length;
  const cancelled = records.filter((r) => r.classStatus === 'Cancelled').length;
  const attended = records.filter((r) => r.attendanceStatus === 'Attended').length;
  const absent = records.filter((r) => r.attendanceStatus === 'Absent').length;
  const notMarked = records.filter((r) => r.attendanceStatus === 'Not Marked').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Single day view</div>
          <h1>Day Search</h1>
          <div className="page-subtitle">Pick any date and see the classes that happened along with whether you attended them.</div>
        </div>
      </div>

      <div className="panel action-panel">
        <div>
          <div className="panel-title">Search by Date</div>
          <p className="panel-help">Useful when you want to verify one exact day instead of scrolling through weekly pages.</p>
        </div>
        <form className="tag-row" style={{ alignItems: 'flex-end' }} onSubmit={handleSearch}>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" type="submit">Search Day</button>
        </form>
      </div>

      {loading ? (
        <Loader text="Loading day records..." />
      ) : (
        <div className="panel">
          <div className="panel-title">
            <span>{formatDate(date)}</span>
            <span className="chip">{records.length} class(es)</span>
          </div>

          {records.length > 0 && (
            <div className="day-stats-strip">
              <div><strong>{happened}</strong><span>Happened</span></div>
              <div><strong>{attended}</strong><span>Attended</span></div>
              <div><strong>{absent}</strong><span>Absent</span></div>
              <div><strong>{notMarked}</strong><span>Not marked</span></div>
              <div><strong>{cancelled}</strong><span>Cancelled</span></div>
            </div>
          )}

          {records.length === 0 ? (
            <EmptyState message="No classes recorded for this date." />
          ) : (
            <div className="session-card-list standalone-list">
              {records.map((r) => (
                <div className="session-card attendance-session-card" key={r._id}>
                  <div className="session-hour">{formatHour(r.hourNumber)}</div>
                  <div className="session-main">
                    <strong>{r.course?.courseName || 'N/A'}</strong>
                    <span>{r.course?.courseCode || 'No code'} · {r.topic || 'No topic added'}</span>
                  </div>
                  <div className="dual-status">
                    <span className={`badge ${r.classStatus === 'Cancelled' ? 'badge-gray' : 'badge-blue'}`}>{r.classStatus}</span>
                    <span className={`badge ${statusBadgeClass(r.attendanceStatus)}`}>{r.attendanceStatus}</span>
                  </div>
                  <div className="session-actions">
                    {r.classStatus === 'Happened' ? (
                      <>
                        <button className="btn btn-sm btn-primary" onClick={() => handleMark(r._id, 'Attended')}>Attended</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleMark(r._id, 'Absent')}>Absent</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleMark(r._id, 'Not Marked')}>Reset</button>
                      </>
                    ) : (
                      <span className="text-muted">Cancelled classes do not affect attendance</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
