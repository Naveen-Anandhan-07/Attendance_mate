const ExcelJS = require('exceljs');
const ClassSession = require('../models/ClassSession');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const Gpa = require('../models/Gpa');
const { calcPercentage, calcStatus, calcLeaveOrRecovery, GRADE_POINTS, round2 } = require('../utils/calc');

const COLORS = {
  navy: '1F2A44',
  blue: '3B5BDB',
  blueSoft: 'EAF0FF',
  header: '24324B',
  lightHeader: 'F3F6FC',
  border: 'D9E1F2',
  text: '1F2937',
  muted: '667085',
  white: 'FFFFFF',
  safe: '2F9E44',
  safeSoft: 'E9F7EC',
  warning: 'F08C00',
  warningSoft: 'FFF4E0',
  critical: 'E03131',
  criticalSoft: 'FDECEC',
  absentSoft: 'FFF0F0',
  attendedSoft: 'ECFDF3',
  cancelledSoft: 'F2F4F7',
  notMarkedSoft: 'FFF8E7'
};

function argb(hex) {
  return hex.replace('#', '').toUpperCase();
}

function fill(hex) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(hex) } };
}

function border(color = COLORS.border) {
  const style = { style: 'thin', color: { argb: argb(color) } };
  return { top: style, left: style, bottom: style, right: style };
}

function hourLabel(hourNumber) {
  const n = Number(hourNumber);
  if (n === 1) return '1st Hour';
  if (n === 2) return '2nd Hour';
  if (n === 3) return '3rd Hour';
  return `${n}th Hour`;
}

function dateLabel(dateString) {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dayLabel(dateString) {
  if (!dateString) return '';
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { weekday: 'long' });
}


function monthSheetName(dateString) {
  if (!dateString) return 'Unknown-Month';
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Unknown-Month';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).replace(' ', '-');
}

function monthKey(dateString) {
  if (!dateString) return '9999-99';
  return dateString.slice(0, 7);
}

function addMonthlyGroupedSheets(workbook, rows, titlePrefix, subtitle, columns, statusKeys = []) {
  const groupedByMonth = new Map();
  rows.forEach((row) => {
    const key = monthKey(row.rawDate || row.date);
    if (!groupedByMonth.has(key)) groupedByMonth.set(key, []);
    groupedByMonth.get(key).push(row);
  });

  [...groupedByMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([, monthRows]) => {
      if (monthRows.length === 0) return;
      const sheetName = monthSheetName(monthRows[0].rawDate || monthRows[0].date);
      addGroupedByDateSheet(
        workbook,
        sheetName,
        `${titlePrefix} - ${sheetName}`,
        subtitle,
        columns,
        monthRows,
        statusKeys
      );
    });
}

function asCourseName(course) {
  if (!course) return 'Deleted Course';
  return `${course.courseCode || ''}${course.courseCode ? ' - ' : ''}${course.courseName || ''}`.trim();
}

function setDefaultSheetSettings(sheet) {
  sheet.properties.defaultRowHeight = 22;
  sheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 }
  };
}

function addTitle(sheet, title, subtitle, columnCount) {
  sheet.mergeCells(1, 1, 1, columnCount);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { size: 18, bold: true, color: { argb: COLORS.white } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  titleCell.fill = fill(COLORS.navy);
  sheet.getRow(1).height = 30;

  sheet.mergeCells(2, 1, 2, columnCount);
  const subtitleCell = sheet.getCell(2, 1);
  subtitleCell.value = subtitle;
  subtitleCell.font = { size: 10, color: { argb: COLORS.muted } };
  subtitleCell.fill = fill(COLORS.lightHeader);
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  sheet.getRow(2).height = 24;

  sheet.addRow([]);
}

function styleHeaderRow(row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: COLORS.white } };
    cell.fill = fill(COLORS.header);
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = border();
  });
  row.height = 24;
}

function styleDataRow(row, rowIndex) {
  row.eachCell((cell) => {
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = border();
    if (rowIndex % 2 === 0) cell.fill = fill('FBFCFF');
  });
}

function styleStatusCell(cell, value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('safe') || text.includes('attended')) {
    cell.font = { bold: true, color: { argb: COLORS.safe } };
    cell.fill = fill(COLORS.safeSoft);
  } else if (text.includes('warning') || text.includes('not marked')) {
    cell.font = { bold: true, color: { argb: COLORS.warning } };
    cell.fill = fill(COLORS.warningSoft);
  } else if (text.includes('critical') || text.includes('absent')) {
    cell.font = { bold: true, color: { argb: COLORS.critical } };
    cell.fill = fill(COLORS.criticalSoft);
  } else if (text.includes('cancelled')) {
    cell.font = { bold: true, color: { argb: COLORS.muted } };
    cell.fill = fill(COLORS.cancelledSoft);
  } else if (text.includes('happened')) {
    cell.font = { bold: true, color: { argb: COLORS.blue } };
    cell.fill = fill(COLORS.blueSoft);
  }
}

function setColumns(sheet, columns) {
  // Do not set `header` here. ExcelJS writes column headers into row 1,
  // but row 1 is our merged report title. Headers are added manually below.
  sheet.columns = columns.map((col) => ({
    key: col.key,
    width: col.width || 16,
    style: col.style || {}
  }));
}

function addTableSheet(workbook, sheetName, title, subtitle, columns, rows, options = {}) {
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 4 }] });
  setDefaultSheetSettings(sheet);
  addTitle(sheet, title, subtitle, columns.length);
  setColumns(sheet, columns);

  const headerRow = sheet.addRow(columns.map((col) => col.header));
  styleHeaderRow(headerRow);

  rows.forEach((rowData, index) => {
    const row = sheet.addRow(columns.map((col) => rowData[col.key] ?? ''));
    styleDataRow(row, index);
    columns.forEach((col, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      if (col.type === 'percentage') cell.numFmt = '0.00%';
      if (col.type === 'number') cell.numFmt = '0';
      if (col.type === 'decimal') cell.numFmt = '0.00';
      if (col.status) styleStatusCell(cell, cell.value);
    });
    if (options.rowStyler) options.rowStyler(row, rowData, columns);
  });

  const headerRowNumber = 4;
  const lastRow = Math.max(sheet.rowCount, headerRowNumber);
  sheet.autoFilter = {
    from: { row: headerRowNumber, column: 1 },
    to: { row: lastRow, column: columns.length }
  };

  for (let r = headerRowNumber + 1; r <= lastRow; r += 1) {
    sheet.getRow(r).commit?.();
  }

  return sheet;
}

function addKpiCards(sheet, cards, startRow, startColumn = 1) {
  let col = startColumn;
  cards.forEach((card) => {
    sheet.mergeCells(startRow, col, startRow, col + 1);
    const label = sheet.getCell(startRow, col);
    label.value = card.label;
    label.font = { bold: true, color: { argb: COLORS.muted }, size: 9 };
    label.fill = fill(COLORS.lightHeader);
    label.alignment = { horizontal: 'center' };
    label.border = border();

    sheet.mergeCells(startRow + 1, col, startRow + 1, col + 1);
    const value = sheet.getCell(startRow + 1, col);
    value.value = card.value;
    value.font = { bold: true, color: { argb: card.color || COLORS.navy }, size: 15 };
    value.fill = fill(card.fill || COLORS.white);
    value.alignment = { horizontal: 'center', vertical: 'middle' };
    value.border = border();
    col += 3;
  });
}

function addGroupedByDateSheet(workbook, sheetName, title, subtitle, columns, rows, statusKeys = []) {
  const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 3 }] });
  setDefaultSheetSettings(sheet);
  addTitle(sheet, title, subtitle, columns.length);
  setColumns(sheet, columns);

  const grouped = new Map();
  rows.forEach((row) => {
    const key = row.rawDate || row.date || 'No Date';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  });

  [...grouped.entries()].forEach(([date, items]) => {
    const happened = items.filter((item) => item.classStatus === 'Happened' || item.status === 'Happened').length;
    const cancelled = items.filter((item) => item.classStatus === 'Cancelled' || item.status === 'Cancelled').length;
    const attended = items.filter((item) => item.myStatus === 'Attended').length;
    const absent = items.filter((item) => item.myStatus === 'Absent').length;

    const groupRow = sheet.addRow([`${dateLabel(date)} • ${dayLabel(date)}    |    ${items.length} classes    |    Happened: ${happened}    |    Cancelled: ${cancelled}${attended || absent ? `    |    Attended: ${attended}    |    Absent: ${absent}` : ''}`]);
    sheet.mergeCells(groupRow.number, 1, groupRow.number, columns.length);
    groupRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: COLORS.navy } };
      cell.fill = fill(COLORS.blueSoft);
      cell.border = border();
      cell.alignment = { vertical: 'middle' };
    });
    groupRow.height = 24;

    const headerRow = sheet.addRow(columns.map((col) => col.header));
    styleHeaderRow(headerRow);

    items.forEach((item, index) => {
      const row = sheet.addRow(columns.map((col) => item[col.key] ?? ''));
      styleDataRow(row, index);
      columns.forEach((col, colIndex) => {
        if (col.status || statusKeys.includes(col.key)) styleStatusCell(row.getCell(colIndex + 1), item[col.key]);
      });
    });
    sheet.addRow([]);
  });

  return sheet;
}

function addNotesSheet(workbook, exportName, notes) {
  const sheet = workbook.addWorksheet('How to Read');
  setDefaultSheetSettings(sheet);
  sheet.columns = [
    { width: 28 },
    { width: 95 }
  ];
  addTitle(sheet, `${exportName} Guide`, 'This sheet explains the exported workbook so it is easier to read later.', 2);
  const rows = [
    ['Grouped date sheets', 'Classes are separated date-wise so the export does not feel like one long list.'],
    ['Filters', 'Table sheets have filters enabled. Use them to view one subject, status, date, or grade at a time.'],
    ['Frozen headers', 'Headers stay visible while scrolling.'],
    ['Color coding', 'Green means safe/attended, orange means warning/not marked, red means critical/absent, grey means cancelled.'],
    ...notes
  ];
  const header = sheet.addRow(['Section', 'Meaning']);
  styleHeaderRow(header);
  rows.forEach((rowData, index) => {
    const row = sheet.addRow(rowData);
    styleDataRow(row, index);
    row.getCell(1).font = { bold: true, color: { argb: COLORS.navy } };
  });
}

async function sendStyledWorkbook(res, filename, buildWorkbook) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Attendance Mate';
  workbook.lastModifiedBy = 'Attendance Mate';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;
  workbook.views = [{ x: 0, y: 0, width: 14000, height: 9000, firstSheet: 0, activeTab: 0, visibility: 'visible' }];

  await buildWorkbook(workbook);

  workbook.eachSheet((sheet) => {
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (!cell.alignment) cell.alignment = { vertical: 'middle' };
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
}

async function buildAttendanceSummaryRows() {
  const courses = await Course.find().sort({ courseCode: 1 });
  const rows = [];

  for (const course of courses) {
    const happenedSessions = await ClassSession.find({ course: course._id, status: 'Happened' });
    const happenedIds = happenedSessions.map((s) => s._id);
    const attendedCount = await Attendance.countDocuments({ classSession: { $in: happenedIds }, attendanceStatus: 'Attended' });
    const notMarkedCount = await Attendance.countDocuments({ classSession: { $in: happenedIds }, attendanceStatus: 'Not Marked' });
    const totalHappened = happenedSessions.length;
    const missed = Math.max(totalHappened - attendedCount, 0);
    const percentage = calcPercentage(attendedCount, totalHappened);
    const status = calcStatus(percentage);
    const recovery = calcLeaveOrRecovery(attendedCount, totalHappened);
    const recoveryText = recovery.type === 'leaves'
      ? `Can miss ${recovery.value} more class${recovery.value === 1 ? '' : 'es'}`
      : `Attend next ${recovery.value} class${recovery.value === 1 ? '' : 'es'} continuously`;

    rows.push({
      courseName: course.courseName,
      courseCode: course.courseCode,
      course: asCourseName(course),
      credits: course.credits,
      totalHours: course.totalHours,
      totalHappened,
      attended: attendedCount,
      missed,
      notMarked: notMarkedCount,
      percentage: percentage / 100,
      percentageDisplay: `${percentage}%`,
      status,
      leaveRecovery: recoveryText,
      priority: status === 'Critical' ? 1 : status === 'Warning' ? 2 : 3
    });
  }

  return rows.sort((a, b) => a.priority - b.priority || a.percentage - b.percentage || a.course.localeCompare(b.course));
}

exports.exportMyAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find().populate('course').populate('classSession').sort({ date: 1 });
    const rows = records
      .filter((r) => r.classSession)
      .map((r) => ({
        rawDate: r.date,
        date: dateLabel(r.date),
        day: dayLabel(r.date),
        hour: hourLabel(r.classSession.hourNumber),
        course: asCourseName(r.course),
        courseName: r.course ? r.course.courseName : '',
        courseCode: r.course ? r.course.courseCode : '',
        topic: r.classSession.topic || '-',
        classStatus: r.classSession.status,
        myStatus: r.attendanceStatus
      }));

    const summaryRows = await buildAttendanceSummaryRows();
    const totalHappened = summaryRows.reduce((sum, row) => sum + row.totalHappened, 0);
    const totalAttended = summaryRows.reduce((sum, row) => sum + row.attended, 0);
    const totalMissed = summaryRows.reduce((sum, row) => sum + row.missed, 0);
    const overall = calcPercentage(totalAttended, totalHappened);

    await sendStyledWorkbook(res, 'my_attendance_formatted.xlsx', async (workbook) => {
      addNotesSheet(workbook, 'My Attendance', [
        ['Course Summary sheet', 'Use this first to understand which subjects are safe and which need attention.'],
        ['Daily Attendance sheet', 'Use this when you want to verify exactly what happened on a particular date.'],
        ['Month-year sheets', 'Every month gets its own sheet, like July-2026, with daily attendance grouped date-wise.']
      ]);

      const summarySheet = addTableSheet(
        workbook,
        'Course Summary',
        'My Attendance Summary',
        `Overall: ${overall}% | Happened: ${totalHappened} | Attended: ${totalAttended} | Missed: ${totalMissed}`,
        [
          { header: 'Course', key: 'course', width: 34 },
          { header: 'Credits', key: 'credits', width: 10, type: 'number' },
          { header: 'Happened', key: 'totalHappened', width: 12, type: 'number' },
          { header: 'Attended', key: 'attended', width: 12, type: 'number' },
          { header: 'Missed', key: 'missed', width: 12, type: 'number' },
          { header: 'Not Marked', key: 'notMarked', width: 13, type: 'number' },
          { header: 'Attendance %', key: 'percentage', width: 15, type: 'percentage' },
          { header: 'Status', key: 'status', width: 13, status: true },
          { header: 'Leave / Recovery', key: 'leaveRecovery', width: 34 }
        ],
        summaryRows
      );
      addKpiCards(summarySheet, [
        { label: 'Overall Attendance', value: `${overall}%`, color: overall >= 75 ? COLORS.safe : COLORS.critical, fill: overall >= 75 ? COLORS.safeSoft : COLORS.criticalSoft },
        { label: 'Classes Happened', value: totalHappened, color: COLORS.navy },
        { label: 'Attended', value: totalAttended, color: COLORS.safe, fill: COLORS.safeSoft },
        { label: 'Missed', value: totalMissed, color: COLORS.critical, fill: COLORS.criticalSoft }
      ], summarySheet.rowCount + 3);

      const attendanceColumns = [
        { header: 'Date', key: 'date', width: 14 },
        { header: 'Day', key: 'day', width: 13 },
        { header: 'Hour', key: 'hour', width: 12 },
        { header: 'Course', key: 'course', width: 34 },
        { header: 'Topic / Remarks', key: 'topic', width: 36 },
        { header: 'Class Status', key: 'classStatus', width: 16, status: true },
        { header: 'My Status', key: 'myStatus', width: 16, status: true }
      ];

      addGroupedByDateSheet(
        workbook,
        'Daily Attendance',
        'Date-wise Attendance Log',
        'Grouped by date so it is easier to read than one long list.',
        attendanceColumns,
        rows,
        ['classStatus', 'myStatus']
      );

      addMonthlyGroupedSheets(
        workbook,
        rows,
        'Daily Attendance',
        'Monthly sheet: each date is grouped with class status and your attendance status.',
        attendanceColumns,
        ['classStatus', 'myStatus']
      );
    });
  } catch (err) {
    next(err);
  }
};

exports.exportClassesHappened = async (req, res, next) => {
  try {
    const sessions = await ClassSession.find().populate('course').sort({ date: 1, hourNumber: 1 });
    const rows = sessions.map((s) => ({
      rawDate: s.date,
      date: dateLabel(s.date),
      day: dayLabel(s.date),
      hour: hourLabel(s.hourNumber),
      course: asCourseName(s.course),
      courseName: s.course ? s.course.courseName : '',
      courseCode: s.course ? s.course.courseCode : '',
      topic: s.topic || '-',
      status: s.status
    }));

    const courseMap = new Map();
    rows.forEach((row) => {
      const key = row.course || 'Deleted Course';
      if (!courseMap.has(key)) courseMap.set(key, { course: key, happened: 0, cancelled: 0, total: 0 });
      const item = courseMap.get(key);
      item.total += 1;
      if (row.status === 'Happened') item.happened += 1;
      if (row.status === 'Cancelled') item.cancelled += 1;
    });
    const courseRows = [...courseMap.values()].sort((a, b) => a.course.localeCompare(b.course));

    const dateRows = [];
    const dateMap = new Map();
    rows.forEach((row) => {
      const key = row.rawDate;
      if (!dateMap.has(key)) dateMap.set(key, { rawDate: key, date: row.date, day: row.day, total: 0, happened: 0, cancelled: 0 });
      const item = dateMap.get(key);
      item.total += 1;
      if (row.status === 'Happened') item.happened += 1;
      if (row.status === 'Cancelled') item.cancelled += 1;
    });
    dateRows.push(...dateMap.values());

    await sendStyledWorkbook(res, 'classes_happened_formatted.xlsx', async (workbook) => {
      addNotesSheet(workbook, 'Classes Happened', [
        ['Daily Classes sheet', 'Classes are visually separated by date. This is the easiest sheet to read.'],
        ['Course Totals sheet', 'Use this to check how many periods happened per subject.'],
        ['Month-year sheets', 'Every month gets its own sheet, like July-2026, with daily classes grouped date-wise.']
      ]);

      const classColumns = [
        { header: 'Date', key: 'date', width: 14 },
        { header: 'Day', key: 'day', width: 13 },
        { header: 'Hour', key: 'hour', width: 12 },
        { header: 'Course', key: 'course', width: 34 },
        { header: 'Topic / Remarks', key: 'topic', width: 40 },
        { header: 'Status', key: 'status', width: 16, status: true }
      ];

      addGroupedByDateSheet(
        workbook,
        'Daily Classes',
        'Classes Happened - Daily View',
        'Each date has its own section with happened/cancelled counts.',
        classColumns,
        rows,
        ['status']
      );

      addMonthlyGroupedSheets(
        workbook,
        rows,
        'Daily Classes',
        'Monthly sheet: each date is grouped with happened/cancelled classes.',
        classColumns,
        ['status']
      );

      addTableSheet(
        workbook,
        'Course Totals',
        'Course-wise Class Count',
        'Quickly understand which courses have had the most classes.',
        [
          { header: 'Course', key: 'course', width: 36 },
          { header: 'Total Recorded', key: 'total', width: 15, type: 'number' },
          { header: 'Happened', key: 'happened', width: 14, type: 'number' },
          { header: 'Cancelled', key: 'cancelled', width: 14, type: 'number' }
        ],
        courseRows
      );

      addTableSheet(
        workbook,
        'Date Totals',
        'Date-wise Class Count',
        'A compact view of how busy each date was.',
        [
          { header: 'Date', key: 'date', width: 14 },
          { header: 'Day', key: 'day', width: 13 },
          { header: 'Total Recorded', key: 'total', width: 15, type: 'number' },
          { header: 'Happened', key: 'happened', width: 14, type: 'number' },
          { header: 'Cancelled', key: 'cancelled', width: 14, type: 'number' }
        ],
        dateRows
      );
    });
  } catch (err) {
    next(err);
  }
};

exports.exportAttendanceSummary = async (req, res, next) => {
  try {
    const rows = await buildAttendanceSummaryRows();
    const totalHappened = rows.reduce((sum, row) => sum + row.totalHappened, 0);
    const totalAttended = rows.reduce((sum, row) => sum + row.attended, 0);
    const overall = calcPercentage(totalAttended, totalHappened);
    const criticalCount = rows.filter((row) => row.status === 'Critical').length;
    const warningCount = rows.filter((row) => row.status === 'Warning').length;

    await sendStyledWorkbook(res, 'attendance_summary_formatted.xlsx', async (workbook) => {
      addNotesSheet(workbook, 'Attendance Summary', [
        ['Priority order', 'Critical subjects appear first, then warning, then safe subjects.'],
        ['Leave / Recovery', 'If safe, it shows how many classes can be missed. If below 75%, it shows how many classes must be attended continuously.']
      ]);

      const sheet = addTableSheet(
        workbook,
        'Summary',
        'Course-wise Attendance Summary',
        `Overall attendance: ${overall}% | Critical: ${criticalCount} | Warning: ${warningCount}`,
        [
          { header: 'Course Code', key: 'courseCode', width: 14 },
          { header: 'Course Name', key: 'courseName', width: 32 },
          { header: 'Credits', key: 'credits', width: 10, type: 'number' },
          { header: 'Total Hours', key: 'totalHours', width: 12, type: 'number' },
          { header: 'Classes Happened', key: 'totalHappened', width: 17, type: 'number' },
          { header: 'Attended', key: 'attended', width: 12, type: 'number' },
          { header: 'Missed', key: 'missed', width: 10, type: 'number' },
          { header: 'Not Marked', key: 'notMarked', width: 13, type: 'number' },
          { header: 'Attendance %', key: 'percentage', width: 15, type: 'percentage' },
          { header: 'Status', key: 'status', width: 13, status: true },
          { header: 'Leave / Recovery', key: 'leaveRecovery', width: 36 }
        ],
        rows
      );

      addKpiCards(sheet, [
        { label: 'Overall Attendance', value: `${overall}%`, color: overall >= 75 ? COLORS.safe : COLORS.critical, fill: overall >= 75 ? COLORS.safeSoft : COLORS.criticalSoft },
        { label: 'Critical Subjects', value: criticalCount, color: COLORS.critical, fill: COLORS.criticalSoft },
        { label: 'Warning Subjects', value: warningCount, color: COLORS.warning, fill: COLORS.warningSoft }
      ], sheet.rowCount + 3);
    });
  } catch (err) {
    next(err);
  }
};

exports.exportGpaReport = async (req, res, next) => {
  try {
    const records = await Gpa.find().populate('course').sort({ createdAt: 1 });
    let totalCredits = 0;
    let weightedSum = 0;
    const rows = records.map((r) => {
      const credits = r.course ? r.course.credits : r.credits;
      const gradePoint = r.grade ? GRADE_POINTS[r.grade] ?? 0 : 0;
      if (r.grade) {
        totalCredits += credits;
        weightedSum += credits * gradePoint;
      }
      return {
        courseCode: r.course ? r.course.courseCode : '',
        courseName: r.course ? r.course.courseName : '',
        credits,
        grade: r.grade || 'Not Filled',
        gradePoint,
        weighted: round2(credits * gradePoint),
        status: r.grade ? 'Filled' : 'Pending'
      };
    });
    const gpa = totalCredits > 0 ? round2(weightedSum / totalCredits) : 0;

    await sendStyledWorkbook(res, 'gpa_report_formatted.xlsx', async (workbook) => {
      addNotesSheet(workbook, 'GPA Report', [
        ['Final GPA', 'Calculated as total credit × grade point divided by total credits.'],
        ['Pending grade', 'Rows marked pending are not included in the GPA total.']
      ]);

      const sheet = addTableSheet(
        workbook,
        'GPA Report',
        'GPA Calculator Report',
        `Final GPA: ${gpa} | Total Credits Counted: ${totalCredits} | Weighted Sum: ${round2(weightedSum)}`,
        [
          { header: 'Course Code', key: 'courseCode', width: 14 },
          { header: 'Course Name', key: 'courseName', width: 34 },
          { header: 'Credits', key: 'credits', width: 10, type: 'number' },
          { header: 'Grade', key: 'grade', width: 12, status: true },
          { header: 'Grade Point', key: 'gradePoint', width: 13, type: 'decimal' },
          { header: 'Credit × Grade Point', key: 'weighted', width: 22, type: 'decimal' },
          { header: 'Status', key: 'status', width: 12, status: true }
        ],
        rows
      );
      addKpiCards(sheet, [
        { label: 'Final GPA', value: gpa, color: gpa >= 8 ? COLORS.safe : gpa >= 6 ? COLORS.warning : COLORS.critical, fill: gpa >= 8 ? COLORS.safeSoft : gpa >= 6 ? COLORS.warningSoft : COLORS.criticalSoft },
        { label: 'Credits Counted', value: totalCredits, color: COLORS.navy },
        { label: 'Weighted Sum', value: round2(weightedSum), color: COLORS.blue, fill: COLORS.blueSoft }
      ], sheet.rowCount + 3);
    });
  } catch (err) {
    next(err);
  }
};
