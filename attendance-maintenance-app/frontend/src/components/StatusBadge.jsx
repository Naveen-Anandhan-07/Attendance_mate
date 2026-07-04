import { statusColor } from '../utils/constants';

export default function StatusBadge({ status }) {
  return <span className={`badge ${statusColor(status)}`}>{status || 'Not Started'}</span>;
}
