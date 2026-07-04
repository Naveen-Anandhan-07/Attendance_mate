import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

const sections = [
  {
    title: 'Start here',
    links: [
      { to: '/', label: 'Home', icon: 'home' },
      { to: '/classes', label: 'Daily classes', icon: 'calendar' },
      { to: '/attendance', label: 'Mark attendance', icon: 'checkCircle' },
      { to: '/day-search', label: 'Day search', icon: 'search' }
    ]
  },
  {
    title: 'Planning',
    links: [
      { to: '/courses', label: 'Courses', icon: 'book' },
      { to: '/timetable', label: 'Weekly timetable', icon: 'fileText' },
      { to: '/bunk-planner', label: 'Bunk planner', icon: 'target' }
    ]
  },
  {
    title: 'Reports',
    links: [
      { to: '/summary', label: 'Attendance report', icon: 'chart' },
      { to: '/gpa', label: 'GPA calculator', icon: 'graduation' },
      { to: '/calendar', label: 'Calendar view', icon: 'calendar' },
      { to: '/export', label: 'Export & backup', icon: 'save' }
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <span className="sidebar-logo">A+</span>
        <span>
          Attendance Mate
          <small>Personal semester tracker</small>
        </span>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div className="nav-section" key={section.title}>
            <div className="nav-section-title">{section.title}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
              >
                <span className="sidebar-icon"><Icon name={link.icon} size={18} /></span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <strong>Daily flow</strong>
        <span>Generate classes → mark attendance → check safe leaves.</span>
      </div>
    </aside>
  );
}
