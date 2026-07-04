import { useEffect, useState } from 'react';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { getBunkPlanner } from '../services/api.js';

export default function BunkPlanner() {
  const [planner, setPlanner] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBunkPlanner().then((res) => {
      setPlanner(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader text="Checking if it is safe to skip..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Decision helper</div>
          <h1>Bunk Planner</h1>
          <div className="page-subtitle">See the effect of skipping or attending the next class before you decide.</div>
        </div>
      </div>

      {planner.length === 0 ? (
        <EmptyState icon="target" title="No courses to plan yet" message="Add courses and record a few classes to get useful bunk suggestions." />
      ) : (
        <div className="bunk-grid">
          {planner.map((p) => {
            const status = p.currentPercentage >= 85 ? 'Safe' : p.currentPercentage >= 75 ? 'Warning' : 'Critical';
            return (
              <div key={p.course._id} className={`bunk-card ${p.canSkipNext ? 'can-skip' : 'dont-skip'}`}>
                <div className="bunk-head">
                  <div>
                    <h3>{p.course.courseName}</h3>
                    <span>{p.course.courseCode}</span>
                  </div>
                  <div className="bunk-verdict">{p.canSkipNext ? 'Safe to skip' : 'Better attend'}</div>
                </div>

                <div className="bunk-main-number">
                  <span>Current attendance</span>
                  <strong>{p.currentPercentage}%</strong>
                </div>
                <ProgressBar value={p.currentPercentage} status={status} />

                <div className="what-if-grid">
                  <div>
                    <span>If you skip next</span>
                    <strong>{p.afterSkipPercentage}%</strong>
                  </div>
                  <div>
                    <span>If you attend next</span>
                    <strong>{p.afterAttendPercentage}%</strong>
                  </div>
                </div>

                <div className="bunk-advice">
                  {p.totalClassesHappened === 0
                    ? 'No classes recorded yet. Mark attendance first for a useful decision.'
                    : p.canSkipNext
                      ? `You have ${p.leavesAvailable} leave(s) available while staying around 75%.`
                      : p.classesNeeded > 0
                        ? `Attend the next ${p.classesNeeded} class(es) continuously to recover.`
                        : 'Skipping now may push you too close to the 75% limit.'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
