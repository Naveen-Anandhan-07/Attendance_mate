import Icon from './Icon.jsx';

export default function EmptyState({ message = 'Nothing here yet.', action, icon = 'folder', title = 'No data yet' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon name={icon} size={34} /></div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
