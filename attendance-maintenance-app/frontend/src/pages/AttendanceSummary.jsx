import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { attendanceMessage } from '../utils/constants.js';
import { getAttendanceSummary } from '../services/api.js';

export default function AttendanceSummary() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAttendanceSummary().then((res) => {
      setSummary(res.data);
      setLoading(false);
    });
  }, []);

  const totals = useMemo(() => {
    const happened = summary.reduce((sum, row) => sum + row.totalClassesHappened, 0);
    const attended = summary.reduce((sum, row) => sum + row.classesAttended, 0);
    const missed = summary.reduce((sum, row) => sum + row.classesMissed, 0);
    const percentage = happened ? ((attended / happened) * 100).toFixed(2) : '0.00';
    return { happened, attended, missed, percentage };
  }, [summary]);

  if (loading) return <Loader text="Loading summary..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Attendance report</div>
          <h1>Course-wise Summary</h1>
          <div className="page-subtitle">Understand exactly where you are safe and where you need recovery.</div>
        </div>
      </div>

      {summary.length === 0 ? (
        <EmptyState icon="chart" title="No attendance data yet" message="Add courses and record classes first. Summary will appear automatically." />
      ) : (
        <>
          <div className="summary-banner">
            <div>
              <span>Overall attendance</span>
              <strong>{totals.percentage}%</strong>
            </div>
            <ProgressBar value={totals.percentage} status={Number(totals.percentage) >= 85 ? 'Safe' : Number(totals.percentage) >= 75 ? 'Warning' : 'Critical'} />
            <div className="summary-metrics">
              <span>{totals.attended} attended</span>
              <span>{totals.missed} missed</span>
              <span>{totals.happened} happened</span>
            </div>
          </div>

          <div className="summary-card-grid">
            {summary.map((row) => (
              <div key={row.course._id} className={`summary-card ${row.status.toLowerCase()}`}>
                <div className="summary-card-head">
                  <div>
                    <h3>{row.course.courseName}</h3>
                    <span>{row.course.courseCode} · {row.course.credits} credits</span>
                  </div>
                  <StatusBadge status={row.status} />
                </div>

                <div className="big-percentage">{row.percentage}%</div>
                <ProgressBar value={row.percentage} status={row.status} />

                <div className="attendance-counts">
                  <div><strong>{row.totalClassesHappened}</strong><span>Happened</span></div>
                  <div><strong>{row.classesAttended}</strong><span>Attended</span></div>
                  <div><strong>{row.classesMissed}</strong><span>Missed</span></div>
                </div>

                <div className="friendly-note">
                  {attendanceMessage(row)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
