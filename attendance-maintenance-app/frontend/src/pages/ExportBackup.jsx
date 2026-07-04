import { useRef, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useToast } from '../components/Toast.jsx';
import { exportUrls, backupExportUrl, importBackup, clearAllData } from '../services/api.js';

export default function ExportBackup() {
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await importBackup(json);
      showToast('Backup restored successfully. Refresh to see updated data.');
    } catch (err) {
      showToast('Failed to restore backup. Please check the file.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleClear = async () => {
    await clearAllData();
    showToast('All data cleared');
    setConfirmClear(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Export / Backup</h1>
          <div className="page-subtitle">Download formatted Excel reports or back up your entire dataset</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Excel Exports</div>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <ExportCard title="My Attendance" desc="Formatted workbook with course summary + date-wise attendance log" href={exportUrls.myAttendance} />
          <ExportCard title="Classes Happened" desc="Daily grouped view + course totals + date totals" href={exportUrls.classesHappened} />
          <ExportCard title="Attendance Summary" desc="Priority-sorted subjects with colored warning/status columns" href={exportUrls.attendanceSummary} />
          <ExportCard title="GPA Report" desc="Styled GPA sheet with final GPA, credits, and weighted score" href={exportUrls.gpaReport} />
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Backup & Restore</div>
        <p className="text-muted">Your data lives in MongoDB. Use these tools to back it up as a JSON file or restore it later.</p>
        <div className="tag-row" style={{ marginTop: 12 }}>
          <a className="btn btn-primary" href={backupExportUrl} target="_blank" rel="noreferrer">Export Full Backup (JSON)</a>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>Import Backup (JSON)</button>
          <input type="file" ref={fileInputRef} accept="application/json" style={{ display: 'none' }} onChange={handleImportFile} />
          <button className="btn btn-danger" onClick={() => setConfirmClear(true)}>Clear All Data</button>
        </div>
      </div>

      <ConfirmModal
        open={confirmClear}
        title="Clear All Data"
        message="This will permanently delete ALL courses, timetable entries, classes, attendance, and GPA records. This action cannot be undone. Consider exporting a backup first."
        confirmLabel="Clear Everything"
        onCancel={() => setConfirmClear(false)}
        onConfirm={handleClear}
      />
    </div>
  );
}

function ExportCard({ title, desc, href }) {
  return (
    <div className="panel" style={{ marginBottom: 0 }}>
      <h3 style={{ fontSize: 15, marginBottom: 6 }}>{title}</h3>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>{desc}</p>
      <a className="btn btn-outline btn-sm" href={href} target="_blank" rel="noreferrer">Download .xlsx</a>
    </div>
  );
}
