import Icon from './Icon.jsx';

export default function Card({ label, value, icon = 'folder', tone = 'default', hint }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon"><Icon name={icon} /></div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  );
}
