import { statusTone } from '../utils/constants.js';

export default function ProgressBar({ value = 0, status, compact = false }) {
  const safeValue = Math.max(0, Math.min(Number(value) || 0, 100));
  const tone = statusTone(status);

  return (
    <div className={`progress-wrap ${compact ? 'compact' : ''}`}>
      <div className="progress-track">
        <div className={`progress-fill ${tone}`} style={{ width: `${safeValue}%` }} />
        <div className="progress-target" title="75% minimum" />
      </div>
      {!compact && (
        <div className="progress-meta">
          <span>0%</span>
          <span>75% minimum</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
}
