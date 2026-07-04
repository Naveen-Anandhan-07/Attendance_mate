import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Icon from '../components/Icon.jsx';
import { attendanceMessage } from '../utils/constants.js';
import { getAttendanceSummary, calculateGpa } from '../services/api.js';

export default function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [gpaInfo, setGpaInfo] = useState({ gpa: 0, totalCredits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [summaryRes, gpaRes] = await Promise.all([getAttendanceSummary(), calculateGpa()]);
      setSummary(summaryRes.data);
      setGpaInfo(gpaRes.data);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalCourses = summary.length;
    const totalHappened = summary.reduce((s, c) => s + c.totalClassesHappened, 0);
    const totalAttended = summary.reduce((s, c) => s + c.classesAttended, 0);
    const totalMissed = summary.reduce((s, c) => s + c.classesMissed, 0);
    const overallPct = totalHappened > 0 ? ((totalAttended / totalHappened) * 100).toFixed(2) : '0.00';
    const belowSeventyFive = summary.filter((c) => c.percentage < 75);
    const warningCourses = summary.filter((c) => c.percentage >= 75 && c.percentage < 85);
    const safeCourses = summary.filter((c) => c.percentage >= 85);
    const priority = [...summary].filter((c) => c.totalClassesHappened > 0 && c.percentage < 85).sort((a, b) => a.percentage - b.percentage);

    return {
      totalCourses,
      totalHappened,
      totalAttended,
      totalMissed,
      overallPct,
      belowSeventyFive,
      warningCourses,
      safeCourses,
      priority
    };
  }, [summary]);

  if (loading) return <Loader text="Loading your semester dashboard..." />;

  const heroTone = Number(stats.overallPct) >= 85 ? 'safe' : Number(stats.overallPct) >= 75 ? 'warning' : 'critical';
  const heroMessage = stats.totalHappened === 0
    ? 'Add courses, generate today’s classes, then start marking attendance.'
    : stats.belowSeventyFive.length > 0
      ? `${stats.belowSeventyFive.length} course(s) need recovery. Focus on them first.`
      : 'You are above the minimum mark. Keep checking before taking leave.';

  return (
    <div>
      <section className={`dashboard-hero hero-${heroTone}`}>
        <div>
          <div className="eyebrow">Semester control center</div>
          <h1>Stay above 75% without guessing.</h1>
          <p>{heroMessage}</p>
          <div className="hero-actions">
            <Link to="/classes" className="btn btn-primary">Generate / add today’s classes</Link>
            <Link to="/attendance" className="btn btn-secondary">Mark attendance</Link>
            <Link to="/bunk-planner" className="btn btn-outline">Can I bunk?</Link>
          </div>
        </div>
        <div className="hero-score-card">
          <span>Overall attendance</span>
          <strong>{stats.overallPct}%</strong>
          <ProgressBar value={stats.overallPct} status={heroTone === 'safe' ? 'Safe' : heroTone === 'warning' ? 'Warning' : 'Critical'} />
        </div>
      </section>

      {stats.totalCourses === 0 ? (
        <EmptyState
          icon="book"
          title="Let’s set up your semester"
          message="Add your courses first. After that, create your timetable and generate daily classes in one click."
          action={<Link to="/courses/add" className="btn btn-primary">Add first course</Link>}
        />
      ) : (
        <>
          <div className="stats-grid friendly-stats">
            <Card icon="book" label="Courses" value={stats.totalCourses} hint="Subjects added" />
            <Card icon="building" label="Classes Happened" value={stats.totalHappened} hint="Cancelled classes ignored" />
            <Card icon="checkCircle" label="Attended" value={stats.totalAttended} tone="green" hint="Marked present" />
            <Card icon="xCircle" label="Missed" value={stats.totalMissed} tone={stats.totalMissed > 0 ? 'red' : 'green'} hint="Absent / not marked" />
            <Card icon="alertTriangle" label="Below 75%" value={stats.belowSeventyFive.length} tone={stats.belowSeventyFive.length ? 'red' : 'green'} hint="Recover first" />
            <Card icon="graduation" label="Current GPA" value={gpaInfo.gpa || 0} hint={`${gpaInfo.totalCredits || 0} credits`} />
          </div>

          <div className="quick-flow-grid">
            <Link to="/courses" className="quick-card">
              <span>1</span>
              <strong>Set courses</strong>
              <small>Add credits once. GPA and reports reuse them.</small>
            </Link>
            <Link to="/timetable" className="quick-card">
              <span>2</span>
              <strong>Build timetable</strong>
              <small>Save your weekly pattern so daily entry is faster.</small>
            </Link>
            <Link to="/classes" className="quick-card">
              <span>3</span>
              <strong>Generate classes</strong>
              <small>Create today’s class list from timetable.</small>
            </Link>
            <Link to="/attendance" className="quick-card">
              <span>4</span>
              <strong>Mark attendance</strong>
              <small>Bulk mark today or update individual classes.</small>
            </Link>
          </div>

          <div className="dashboard-grid">
            <div className="panel large-panel">
              <div className="panel-title">
                <span>Course health</span>
                <Link to="/summary" className="link-soft">Full report →</Link>
              </div>

              <div className="course-health-list">
                {summary.map((row) => (
                  <div key={row.course._id} className="health-row">
                    <div className="health-main">
                      <div>
                        <strong>{row.course.courseName}</strong>
                        <span>{row.course.courseCode} · {row.course.credits} credits</span>
                      </div>
                      <StatusBadge status={row.status} />
                    </div>
                    <div className="health-progress">
                      <ProgressBar value={row.percentage} status={row.status} compact />
                      <strong>{row.percentage}%</strong>
                    </div>
                    <div className="health-foot">
                      <span>{row.classesAttended}/{row.totalClassesHappened} attended</span>
                      <span>{attendanceMessage(row)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel focus-panel">
              <div className="panel-title">What needs attention?</div>
              {stats.priority.length === 0 ? (
                <div className="success-note">
                  <div className="success-icon"><Icon name="sparkles" size={32} /></div>
                  <strong>All good for now.</strong>
                  <p>Every course with recorded classes is in the safe zone.</p>
                </div>
              ) : (
                <div className="priority-list">
                  {stats.priority.slice(0, 5).map((row) => (
                    <div key={row.course._id} className={`priority-item ${row.percentage < 75 ? 'critical' : ''}`}>
                      <div>
                        <strong>{row.course.courseName}</strong>
                        <small>{attendanceMessage(row)}</small>
                      </div>
                      <span>{row.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mini-summary-grid">
                <div>
                  <strong>{stats.safeCourses.length}</strong>
                  <span>Safe</span>
                </div>
                <div>
                  <strong>{stats.warningCourses.length}</strong>
                  <span>Warning</span>
                </div>
                <div>
                  <strong>{stats.belowSeventyFive.length}</strong>
                  <span>Critical</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
