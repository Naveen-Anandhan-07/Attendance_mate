import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  formatDate,
  todayStr,
  formatHour,
  getWeekRange,
  shiftDate,
  isDateInRange,
  formatWeekRange
} from '../utils/constants.js';
import { getAttendance, markAttendance, bulkMarkAttendance, getTodayClasses } from '../services/api.js';

function statusBadgeClass(status) {
  if (status === 'Attended') return 'badge-green';
  if (status === 'Absent') return 'badge-red';
  return 'badge-gray';
}

export default function MarkAttendance() {
  const [records, setRecords] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [weekAnchor, setWeekAnchor] = useState(todayStr());
  const { showToast } = useToast();

  useEffect(() => {
    load();
  }, []);

  const weekRange = useMemo(() => getWeekRange(weekAnchor), [weekAnchor]);

  const load = async () => {
    setLoading(true);
    try {
      const [attRes, todayRes] = await Promise.all([getAttendance(), getTodayClasses()]);
      setRecords(attRes.data);
      setTodaySessions(todayRes.data);
    } finally {
      setLoading(false);
    }
  };

  const handleMark = async (classSessionId, status) => {
    await markAttendance(classSessionId, status);
    load();
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const bulkMarkToday = async () => {
    const happenedToday = todaySessions.filter((s) => s.status === 'Happened').map((s) => s._id);
    if (happenedToday.length === 0) {
      showToast('No classes happened today', 'error');
      return;
    }
    await bulkMarkAttendance(happenedToday, 'Attended');
    showToast(`Marked ${happenedToday.length} class(es) as attended`);
    setWeekAnchor(todayStr());
    load();
  };

  const bulkMarkSelected = async (status) => {
    if (selected.length === 0) {
      showToast('Select at least one class', 'error');
      return;
    }
    await bulkMarkAttendance(selected, status);
    showToast(`${selected.length} record(s) marked as ${status}`);
    setSelected([]);
    load();
  };

  const weeklyRecords = useMemo(() => {
    return records
      .filter((r) => r.classSession && r.classSession.status === 'Happened')
      .filter((r) => isDateInRange(r.date, weekRange.start, weekRange.end))
      .sort((a, b) => (b.date.localeCompare(a.date) || a.classSession.hourNumber - b.classSession.hourNumber));
  }, [records, weekRange]);

  const groupedRecords = useMemo(() => {
    const groups = weeklyRecords.reduce((acc, record) => {
      if (!acc[record.date]) acc[record.date] = [];
      acc[record.date].push(record);
      return acc;
    }, {});

    return Object.entries(groups)
      .map(([date, items]) => {
        const sortedItems = [...items].sort((a, b) => a.classSession.hourNumber - b.classSession.hourNumber);
        return {
          date,
          items: sortedItems,
          attended: sortedItems.filter((r) => r.attendanceStatus === 'Attended').length,
          absent: sortedItems.filter((r) => r.attendanceStatus === 'Absent').length,
          notMarked: sortedItems.filter((r) => r.attendanceStatus === 'Not Marked').length
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [weeklyRecords]);

  if (loading) return <Loader text="Loading attendance..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Weekly marking</div>
          <h1>Mark Attendance</h1>
          <div className="page-subtitle">Only one week is shown at a time. Your older records are saved and can be checked from Day Search or Excel.</div>
        </div>
        <div className="header-actions-stack">
          <button className="btn btn-primary" onClick={bulkMarkToday}><Icon name="checkCircle" className="btn-icon" size={17} /> Mark all today as attended</button>
          <div className="week-switcher compact">
            <button className="btn btn-secondary btn-sm" onClick={() => setWeekAnchor(shiftDate(weekRange.start, -7))}>← Previous</button>
            <div>
              <span>Selected week</span>
              <strong>{formatWeekRange(weekRange.start, weekRange.end)}</strong>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setWeekAnchor(shiftDate(weekRange.start, 7))}>Next →</button>
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="selection-toolbar">
          <div className="flex-between">
            <span>{selected.length} class(es) selected</span>
            <div className="tag-row">
              <button className="btn btn-primary btn-sm" onClick={() => bulkMarkSelected('Attended')}>Mark Attended</button>
              <button className="btn btn-danger btn-sm" onClick={() => bulkMarkSelected('Absent')}>Mark Absent</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelected([])}>Clear</button>
            </div>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-title">
          <span>My Attendance This Week</span>
          <span className="chip">{weeklyRecords.length} class(es)</span>
        </div>
        <p className="panel-help">Grouped day-wise so you can quickly see what you attended, missed, or still need to mark.</p>

        {weeklyRecords.length === 0 ? (
          <EmptyState message={`No happened classes found for ${formatWeekRange(weekRange.start, weekRange.end)}.`} />
        ) : (
          <div className="class-day-list">
            {groupedRecords.map((group) => (
              <div className="class-day-group" key={group.date}>
                <div className="class-day-header">
                  <div>
                    <h3>{formatDate(group.date)}</h3>
                    <span>{group.items.length} happened class(es)</span>
                  </div>
                  <div className="class-day-metrics">
                    <span className="badge badge-green">{group.attended} attended</span>
                    <span className="badge badge-red">{group.absent} absent</span>
                    <span className="badge badge-gray">{group.notMarked} not marked</span>
                  </div>
                </div>

                <div className="session-card-list">
                  {group.items.map((r) => (
                    <AttendanceCard
                      key={r._id}
                      record={r}
                      selected={selected.includes(r.classSession._id)}
                      toggleSelect={toggleSelect}
                      handleMark={handleMark}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AttendanceCard({ record, selected, toggleSelect, handleMark }) {
  const classSessionId = record.classSession._id;

  return (
    <div className="session-card attendance-session-card">
      <label className="select-dot" title="Select for bulk marking">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleSelect(classSessionId)}
        />
        <span>{formatHour(record.classSession?.hourNumber)}</span>
      </label>
      <div className="session-main">
        <strong>{record.course?.courseName || 'N/A'}</strong>
        <span>{record.course?.courseCode || 'No code'} · {record.classSession?.topic || 'No topic added'}</span>
      </div>
      <span className={`badge ${statusBadgeClass(record.attendanceStatus)}`}>{record.attendanceStatus}</span>
      <div className="session-actions">
        <button className="btn btn-sm btn-primary" onClick={() => handleMark(classSessionId, 'Attended')}>Attended</button>
        <button className="btn btn-sm btn-danger" onClick={() => handleMark(classSessionId, 'Absent')}>Absent</button>
        <button className="btn btn-sm btn-secondary" onClick={() => handleMark(classSessionId, 'Not Marked')}>Reset</button>
      </div>
    </div>
  );
}
