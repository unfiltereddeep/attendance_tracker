# Student Attendance Tracker

A fully client-side web application designed to accurately track and analyze student attendance while eliminating common manual errors in percentage calculation.

Unlike basic present/absent trackers, this system models attendance in **units (hours)** and supports **weekly schedules, extra classes, and cancelled sessions**, ensuring fair and realistic attendance computation.

---

## 🚀 Features

- Unit-based attendance tracking (hours instead of simple counts)
- Weekly schedule–driven class recommendations
- Support for extra classes and cancelled sessions
- Automatic subject-wise and overall attendance calculation
- Real-time, color-coded dashboard with configurable thresholds
- CSV export with subject-wise and date-range filters
- Offline-first design using browser localStorage
- Data integrity checks to prevent duplicate entries
- Responsive and user-friendly interface

---

## 🧠 Attendance Logic

- **Present:** attended units = total units  
- **Absent:** attended units = 0, total units counted  
- **Cancelled:** neither attended nor total units counted  
- **Extra classes:** treated independently and included in calculations  

Attendance Percentage:

