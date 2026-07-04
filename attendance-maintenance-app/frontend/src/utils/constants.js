export const GRADE_OPTIONS = ['O', 'S', 'A+', 'A', 'B+', 'B', 'C', 'F'];

export const GRADE_POINTS = {
  O: 10,
  S: 10,
  'A+': 9,
  A: 8,
  'B+': 7,
  B: 6,
  C: 5,
  F: 0
};

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function statusColor(status) {
  if (status === 'Safe') return 'badge-green';
  if (status === 'Warning') return 'badge-orange';
  if (status === 'Critical') return 'badge-red';
  return 'badge-gray';
}

export function statusTone(status) {
  if (status === 'Safe') return 'safe';
  if (status === 'Warning') return 'warning';
  if (status === 'Critical') return 'critical';
  return 'muted';
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function formatHour(hour) {
  const value = Number(hour);
  const suffix = value === 1 ? 'st' : value === 2 ? 'nd' : value === 3 ? 'rd' : 'th';
  return `${value}${suffix} Hour`;
}

export function attendanceMessage(row) {
  if (!row || row.totalClassesHappened === 0) return 'No classes recorded yet';
  if (row.status === 'Safe') return `Comfortable buffer · ${row.leaveOrRecovery.value} leave(s) available`;
  if (row.status === 'Warning') return `Be careful · ${row.leaveOrRecovery.value} leave(s) available`;
  return `Needs focus · attend next ${row.leaveOrRecovery.value} class(es)`;
}


export function getWeekRange(dateStr = todayStr()) {
  const date = new Date(`${dateStr}T00:00:00`);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

export function shiftDate(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function isDateInRange(dateStr, start, end) {
  return Boolean(dateStr && start && end && dateStr >= start && dateStr <= end);
}

export function formatWeekRange(start, end) {
  return `${formatDate(start)} - ${formatDate(end)}`;
}
