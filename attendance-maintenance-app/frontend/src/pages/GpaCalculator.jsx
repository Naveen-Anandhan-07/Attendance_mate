import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useToast } from '../components/Toast.jsx';
import { GRADE_OPTIONS } from '../utils/constants.js';
import { getGpaRecords, saveGrade, calculateGpa, resetGrades } from '../services/api.js';

export default function GpaCalculator() {
  const [records, setRecords] = useState([]);
  const [gpaInfo, setGpaInfo] = useState({ gpa: 0, totalCredits: 0 });
  const [loading, setLoading] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [gpaRes, calcRes] = await Promise.all([getGpaRecords(), calculateGpa()]);
      setRecords(gpaRes.data);
      setGpaInfo(calcRes.data);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = async (courseId, grade) => {
    await saveGrade(courseId, grade);
    const calcRes = await calculateGpa();
    setGpaInfo(calcRes.data);
    const gpaRes = await getGpaRecords();
    setRecords(gpaRes.data);
  };

  const handleReset = async () => {
    await resetGrades();
    showToast('All grades reset');
    setConfirmReset(false);
    load();
  };

  const filledCount = useMemo(() => records.filter((r) => r.grade).length, [records]);

  if (loading) return <Loader text="Loading GPA calculator..." />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Grades</div>
          <h1>GPA Calculator</h1>
          <div className="page-subtitle">Credits are already filled from your courses. Just pick grades.</div>
        </div>
        <button className="btn btn-outline" onClick={() => setConfirmReset(true)}>Reset Grades</button>
      </div>

      {records.length === 0 ? (
        <EmptyState icon="graduation" title="Add courses first" message="Once courses are added, this page will automatically list them with credits filled in." />
      ) : (
        <>
          <div className="gpa-hero">
            <div>
              <span>Current GPA</span>
              <strong>{gpaInfo.gpa}</strong>
              <p>{filledCount}/{records.length} courses graded · {gpaInfo.totalCredits} credits counted</p>
            </div>
            <div className="grade-guide">
              {['O/S = 10', 'A+ = 9', 'A = 8', 'B+ = 7', 'B = 6', 'C = 5', 'F = 0'].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="grade-card-grid">
            {records.map((r) => {
              const credits = r.course?.credits ?? r.credits;
              return (
                <div key={r._id} className="grade-card">
                  <div>
                    <h3>{r.course?.courseName}</h3>
                    <span>{r.course?.courseCode} · {credits} credits</span>
                  </div>

                  <label>Select grade</label>
                  <select value={r.grade || ''} onChange={(e) => handleGradeChange(r.course._id, e.target.value)}>
                    <option value="">Not selected</option>
                    {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>

                  <div className="grade-result-row">
                    <div>
                      <span>Point</span>
                      <strong>{r.gradePoint}</strong>
                    </div>
                    <div>
                      <span>Weighted</span>
                      <strong>{(credits * r.gradePoint).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmReset}
        title="Reset All Grades"
        message="This will clear all selected grades. Your courses and attendance data will not be affected."
        confirmLabel="Reset"
        onCancel={() => setConfirmReset(false)}
        onConfirm={handleReset}
      />
    </div>
  );
}
