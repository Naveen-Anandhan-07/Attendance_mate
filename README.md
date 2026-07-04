# Attendance Mate

A personal MERN stack attendance maintenance and GPA calculator app built for students.

Attendance Mate helps track daily classes, mark personal attendance, calculate course-wise attendance percentage, plan safe leaves, calculate GPA, and export clean Excel reports.

## Features

### Course Management

* Add, edit, and delete semester courses
* Store course name, course code, credits, total hours, semester, and faculty name
* Course credits are automatically used in the GPA calculator

### Weekly Timetable

* Create a weekly timetable template
* Supports 1st hour to 9th hour
* Generate daily classes from the timetable
* Avoids manually entering repeated class schedules every day

### Daily Classes

* Record classes that happened each day
* Mark class status as `Happened` or `Cancelled`
* Add topic or remarks for each class
* Classes are shown week-wise for easier viewing
* Previous and next week navigation is available

### Personal Attendance

* Mark each happened class as:

  * Attended
  * Absent
  * Not Marked
* Attendance records are grouped day-wise
* Only one week of attendance data is shown at a time for better readability
* Cancelled classes do not affect attendance percentage

### Day Search

* Search attendance for a single date
* View classes that happened on that day
* See whether each class was attended, absent, cancelled, or not marked

### Attendance Summary

For each course, the app calculates:

* Total classes happened
* Classes attended
* Classes missed
* Attendance percentage
* Attendance status
* Leave availability
* Recovery requirement

Attendance status rules:

* `85% and above` - Safe
* `75% to 84.99%` - Warning
* `Below 75%` - Critical

### Bunk Planner

The Bunk Planner helps decide whether it is safe to skip the next class.

It shows:

* Current attendance percentage
* Attendance after skipping one class
* Attendance after attending one class
* Number of classes that can be skipped safely
* Number of classes needed to reach 75% if attendance is low

### GPA Calculator

* Automatically lists all added courses
* Credits are pre-filled from course details
* User only needs to select grades
* Calculates GPA instantly

Grade mapping:

| Grade | Point |
| ----- | ----: |
| O     |    10 |
| S     |    10 |
| A+    |     9 |
| A     |     8 |
| B+    |     7 |
| B     |     6 |
| C     |     5 |
| F     |     0 |

GPA formula:

```txt
GPA = sum(credits × grade point) / sum(credits)
```

### Excel Export

The app supports user-friendly Excel exports.

Available exports:

* My Attendance
* Classes Happened
* Course-wise Attendance Summary
* GPA Report

Excel reports include:

* Styled headers
* Frozen rows
* Filters
* Better column widths
* Wrapped text
* Status-based formatting
* Separate month-wise sheets named like `July-2026`

### Backup and Restore

* Export all app data as JSON
* Import backup data later
* Clear all data with confirmation

## Tech Stack

### Frontend

* React.js
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* ExcelJS
* dotenv
* CORS

## Project Structure

```txt
attendance-maintenance-app/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
├── README.md
└── .gitignore
```

## Getting Started

### Prerequisites

Make sure these are installed:

* Node.js
* npm
* MongoDB

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/attendance-maintenance
```

Start the backend:

```bash
npm run dev
```

The backend will run on:

```txt
http://localhost:5000
```

## Frontend Setup

Open another terminal and go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on:

```txt
http://localhost:5173
```

## How to Use

1. Add all semester courses from the Courses page.
2. Create your weekly timetable.
3. Generate daily classes from the timetable or add classes manually.
4. Mark your attendance for happened classes.
5. Check the dashboard and attendance summary regularly.
6. Use the Bunk Planner before skipping a class.
7. Enter grades in the GPA Calculator.
8. Export Excel reports whenever needed.
9. Use Backup and Restore to save your data safely.

## Attendance Calculation

Attendance percentage is calculated course-wise:

```txt
Attendance Percentage = (Classes Attended / Classes Happened) × 100
```

Cancelled classes are ignored.

## Leave Calculation

If attendance is 75% or above:

```txt
Maximum leaves allowed = floor((attended / 0.75) - total classes happened)
```

If attendance is below 75%:

```txt
Classes needed = ceil((0.75 × total classes happened - attended) / 0.25)
```

## Notes

* This app is designed for personal use.
* No login or authentication is included.
* Data is stored locally in MongoDB.
* Do not commit `.env`, `node_modules`, generated Excel files, or backup files to GitHub.

## Future Improvements

Possible features to add later:

* Dark mode
* Subject-wise charts
* Monthly attendance calendar
* Notification reminders
* Import timetable from Excel
* Mobile-first attendance marking
* Semester-wise archive
