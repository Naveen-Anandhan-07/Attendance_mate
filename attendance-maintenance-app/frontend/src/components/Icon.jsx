const paths = {
  home: [
    'M3 10.5 12 3l9 7.5',
    'M5 9.5V21h14V9.5',
    'M9 21v-6h6v6'
  ],
  calendar: [
    'M7 3v4',
    'M17 3v4',
    'M4 8h16',
    'M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z'
  ],
  checkCircle: [
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    'm8.5 12.2 2.2 2.2 4.8-5'
  ],
  search: [
    'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z',
    'm21 21-4.3-4.3'
  ],
  book: [
    'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z',
    'M4 18.5A2.5 2.5 0 0 1 6.5 16H20',
    'M8 7h8'
  ],
  fileText: [
    'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z',
    'M14 3v6h6',
    'M8 13h8',
    'M8 17h6'
  ],
  target: [
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
    'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z'
  ],
  chart: [
    'M4 19V5',
    'M4 19h17',
    'M8 15l3-3 3 2 4-6'
  ],
  graduation: [
    'M22 9 12 4 2 9l10 5 10-5Z',
    'M6 11v5c3 3 9 3 12 0v-5',
    'M20 10v6'
  ],
  save: [
    'M5 3h12l2 2v16H5V3Z',
    'M8 3v6h8V3',
    'M8 21v-7h8v7'
  ],
  building: [
    'M4 21V7l8-4 8 4v14',
    'M8 21v-5h8v5',
    'M8 10h.01',
    'M12 10h.01',
    'M16 10h.01',
    'M8 14h.01',
    'M12 14h.01',
    'M16 14h.01'
  ],
  xCircle: [
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    'm9 9 6 6',
    'm15 9-6 6'
  ],
  alertTriangle: [
    'M12 4 22 20H2L12 4Z',
    'M12 9v5',
    'M12 17h.01'
  ],
  sparkles: [
    'M12 3l1.7 4.4L18 9l-4.3 1.6L12 15l-1.7-4.4L6 9l4.3-1.6L12 3Z',
    'M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z',
    'M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z'
  ],
  folder: [
    'M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z'
  ]
};

export default function Icon({ name = 'folder', className = '', size = 20, strokeWidth = 2 }) {
  const selected = paths[name] || paths.folder;
  return (
    <svg
      className={`app-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {selected.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
