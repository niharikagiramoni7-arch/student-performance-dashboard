# 🎓 Student Performance Dashboard

A comprehensive, production-grade Academic Management Web Application for **Students**, **Faculty**, and **Administrators**. It allows educational institutions to seamlessly monitor and manage attendance, marks, coursework assignments, dynamic CGPA/SGPA calculations, predictive academic analytics, interactive Chart.js visualizations, and institutional performance reports.

---

## 🚀 Key Features by User Role

### 1. 👨‍🎓 Student Portal
- **Registration & OTP Verification:** Student self-registration requiring full name, unique student roll number, department, year, section, email, and password. Verification via a 6-digit email OTP (with 60-second cooldown timer and development fallback).
- **Academic KPI Cards:** Quick glance at Current CGPA, Overall Attendance %, Total Subjects, and Pending Coursework.
- **Subject-Wise Attendance Monitoring:** Real-time percentage tracking per subject with distinct visual alerts (amber/red warning) for attendance below **75%**.
- **Marks Breakdown & Grade Calculation:** View internal marks (max 40), external marks (max 60), total marks (max 100), letter grade (O, A+, A, B+, B, C, P, F), and grade points (0–10).
- **Coursework & Assignment Submissions:** Browse assignments with deadlines, submit work with notes and repository/document URLs, and view faculty grading and qualitative feedback.
- **Performance Analytics & Trend Charts:**
  - Dynamic SGPA semester-over-semester trend line chart.
  - Subject marks comparison bar chart.
  - Attendance breakdown doughnut chart.
- **AI/Heuristic Strengths & Areas for Improvement:** Automatic calculation of subject masteries, attendance warnings, and pending assignment reminders.
- **Profile & Security:** View student profile, update phone number, and change account password.

### 2. 👨‍🏫 Faculty Portal
- **Faculty Dashboard:** Live metrics including total students taught, active subjects, average class attendance %, and average class marks.
- **Student Directory & Filtering:** Fast search and multi-criteria filtering by Department, Year, Section, and Student Name/Roll Number.
- **Attendance Management:** Record date-wise attendance (`PRESENT` or `ABSENT`) per subject with optional remarks.
- **Marks Entry & Auto-Calculation:** Enter internal (0–40) and external (0–60) marks. The system automatically computes total marks, letter grades, grade points, and triggers a real-time recalculation of the student's cumulative CGPA.
- **Coursework & Assignment Manager:** Create, update, and manage homework and project assignments with due dates and maximum marks.
- **Assignment Evaluation & Grading:** View student submissions, review submitted URLs/text, assign marks, and provide written feedback.
- **Faculty Profile Management:** Update personal contact details, designation, and password.

### 3. 🛡️ Administrator Portal
- **Executive Analytics:** High-level institutional metrics including total students, faculty members, subjects, campus-wide average CGPA, and average attendance rate.
- **Visual Institutional Charts (Chart.js):**
  1. *Students by Department* (Doughnut chart)
  2. *Average CGPA by Department* (Bar chart)
  3. *Average Attendance by Department* (Bar chart)
  4. *Performance by Semester Trend* (Line chart)
- **User Account Management (CRUD):**
  - Full paginated table of all registered users (Students, Faculty, Admins).
  - Search by name/email and filter by role (`ROLE_STUDENT`, `ROLE_FACULTY`, `ROLE_ADMIN`).
  - Create new user accounts with automated role-specific profile generation.
  - Edit user details and deactivate/delete accounts.
- **Curriculum & Subjects Management:** View and create institutional course subjects, codes, department associations, and credit weighting.
- **6 Institutional Academic Reports:**
  1. *Overall Student Performance Report*
  2. *Attendance Defaulters Report (<75%)*
  3. *Top Performers / Dean's Honor Roll Report*
  4. *Coursework & Assignment Status Report*
  5. *Department-Wise Academic Summary*
  6. *Subject-Wise Pass/Fail Distribution*
- **Report Exporting:** Download instant CSV exports or trigger formatted printable PDF views.

---

## 💻 Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Modern Responsive Flexbox/Grid, CSS Custom Variables), Vanilla JavaScript (ES6+), Chart.js (v4.4 via CDN) |
| **Backend** | Java 21, Spring Boot 3.4.5, Spring Security 6 (Stateless JWT), Spring Data JPA, Hibernate, Jakarta Validation, Lombok |
| **Database** | MySQL (`student_performance_db`) with standalone `schema.sql` and `seed.sql`, plus automatic resilient embedded H2 fallback for zero-downtime startup |
| **Security** | BCrypt password hashing, JJWT (v0.12.6) token generation and verification, Role-based endpoint authorization |
| **Email/OTP** | Spring Mail (`JavaMailSender`) with automatic development console fallback logging |

---

## 🔑 Demo Login Credentials

The system comes pre-populated with realistic institutional seed data:

| Role | Email Address | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@university.edu` | `Admin@123` | Institutional Administrator |
| **Faculty** | `prof.sharma@university.edu` | `Faculty@123` | Associate Professor, Computer Science |
| **Faculty** | `prof.patel@university.edu` | `Faculty@123` | Assistant Professor, Information Technology |
| **Faculty** | `prof.rao@university.edu` | `Faculty@123` | Professor, Electronics & Communication |
| **Student** | `student1@university.edu` | `Student@123` | Aarav Mehta (Roll: `STU-2024-001`, Sem 3) |
| **Student** | `student2@university.edu` | `Student@123` | Priya Sharma (Roll: `STU-2024-002`, Sem 3) |
| **Student** | `student3@university.edu` through `student10@university.edu` | `Student@123` | Active Students across Departments |

---

## 📁 Project Directory Structure

```
student-performance-dashboard/
├── backend/
│   ├── pom.xml                                  # Maven dependencies & build configuration
│   ├── src/main/java/com/studentdashboard/
│   │   ├── StudentPerformanceApplication.java  # Spring Boot Main Entrypoint
│   │   ├── config/                              # SecurityConfig, JwtUtil, DataSourceConfig, DatabaseInitializer
│   │   ├── controller/                          # AuthController, StudentController, FacultyController, AdminController
│   │   ├── dto/                                 # AuthDtos, StudentDtos, FacultyDtos, AdminDtos
│   │   ├── entity/                              # JPA Entities (User, Student, Faculty, Subject, Mark, Attendance, etc.)
│   │   ├── repository/                          # Spring Data JPA Repositories
│   │   ├── service/                             # AuthService, StudentService, FacultyService, AdminService, ReportService
│   │   └── exception/                           # GlobalExceptionHandler
│   └── src/main/resources/
│       ├── application.properties               # Database & Server configuration
│       └── static/                              # Production bundled frontend resources
├── frontend/                                    # Standalone Vanilla Frontend
│   ├── index.html                               # Institutional Landing Page
│   ├── role-selection.html                      # Role Selection Hub
│   ├── css/
│   │   └── styles.css                           # Master Responsive Design System & Themes
│   ├── js/
│   │   ├── api.js                               # Centralized API client & Toast system
│   │   ├── auth.js                              # Session management & route protection
│   │   ├── charts.js                            # Reusable Chart.js wrappers
│   │   ├── notifications.js                     # In-app notifications dropdown & polling
│   │   ├── student-dashboard.js                 # Student portal controllers
│   │   ├── faculty-dashboard.js                 # Faculty portal controllers
│   │   ├── admin-dashboard.js                   # Admin analytics & user management
│   │   └── reports.js                           # Institutional report generators & CSV export
│   ├── student/                                 # Student login, register, verify-otp, dashboard
│   ├── faculty/                                 # Faculty login, dashboard
│   └── admin/                                   # Admin login, dashboard
└── database/
    ├── schema.sql                               # Clean MySQL DDL table creation script
    └── seed.sql                                 # Complete demo dataset seed script
```

---

## ⚡ How to Run the Application

### 1. Run with Java / Spring Boot (Recommended)
The Spring Boot backend comes with the complete frontend bundled into `src/main/resources/static/`. Running the Spring Boot application serves both the backend REST APIs and the frontend on port `8080`.

1. Make sure **Java 21** and **Maven** are available.
2. From the project root, start the pre-compiled JAR:
   ```powershell
   java -jar backend/target/student-performance-backend-0.0.1-SNAPSHOT.jar
   ```
   *Or build and run directly with Maven:*
   ```powershell
   cd backend
   mvn spring-boot:run
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

### 2. Resilient Database Configuration
The application is pre-configured with a **smart zero-downtime datasource** (`DataSourceConfig`):
- By default, it connects to local MySQL on `jdbc:mysql://localhost:3306/student_performance_db`.
- If MySQL is running with custom credentials, you can provide them via environment variables:
  ```powershell
  $env:MYSQL_URL = "jdbc:mysql://localhost:3306/student_performance_db"
  $env:MYSQL_USER = "root"
  $env:MYSQL_PASSWORD = "your_password"
  ```
- If local MySQL credentials differ or MySQL is offline, the backend **automatically and seamlessly switches to an embedded H2 database in MySQL compatibility mode**, auto-seeding all demo accounts, subjects, attendance, and marks.

### 3. Optional Standalone Frontend
If you wish to serve the `frontend/` directory with a separate dev server (such as VS Code Live Server or Python HTTP server on port 3000 or 5500):
```powershell
cd frontend
python -m http.server 5500
```
Open `http://localhost:5500`. The API client in `frontend/js/api.js` automatically detects external origins and routes all API calls to `http://localhost:8080/api` with pre-configured CORS support.

---

## 📊 Academic Grading & Calculation Rules

- **Marks Formula:**
  $$\text{Total Marks} = \text{Internal Marks (Max 40)} + \text{External Marks (Max 60)} = 100$$
- **Grading Scale:**
  - $\ge 90$: **O** (Grade Point: 10.0)
  - $80 - 89$: **A+** (Grade Point: 9.0)
  - $70 - 79$: **A** (Grade Point: 8.0)
  - $60 - 69$: **B+** (Grade Point: 7.0)
  - $55 - 59$: **B** (Grade Point: 6.0)
  - $50 - 54$: **C** (Grade Point: 5.0)
  - $40 - 49$: **P** (Pass, Grade Point: 4.0)
  - $< 40$: **F** (Fail, Grade Point: 0.0)
- **SGPA Formula:**
  $$\text{SGPA} = \frac{\sum (\text{Subject Grade Point} \times \text{Subject Credits})}{\sum \text{Subject Credits}}$$
- **CGPA Formula:**
  $$\text{CGPA} = \frac{\sum (\text{SGPA} \times \text{Semester Credits})}{\sum \text{Total Credits}}$$
- **Attendance Warning:**
  Any subject or overall attendance falling below **75.0%** triggers an automated warning badge, detention caution, and recommendation for remedial action.

---

## 🧪 Automated End-to-End Verification

The complete functional test script `scratch/test_api.ps1` verifies all 13 major test suites against the live running server:

```powershell
powershell -ExecutionPolicy Bypass -File scratch/test_api.ps1
```

**Test Results:**
- ✅ **API Health:** Server responding `UP`.
- ✅ **Admin Login & JWT Token:** Validated with role claims.
- ✅ **Admin Statistics & Chart Aggregations:** Accurately aggregated across 4 departments.
- ✅ **User Management CRUD & Pagination:** Page 0 returned with 10+ users, searchable and filterable.
- ✅ **Institutional Reports & CSV Generation:** Generated formatted CSV reports.
- ✅ **Faculty Login & Assignment Management:** Accessed assigned subjects and student submissions.
- ✅ **Faculty Attendance & Marks Entry:** Successfully recorded attendance and marks, dynamically triggering automatic CGPA re-computation.
- ✅ **Student Login & Academic Dashboard:** Verified KPI cards, marks breakdown, attendance percentages, and dynamic strength/weakness analysis.
- ✅ **Coursework Assignment Submission:** Submissions recorded with timestamps, statuses, and links.
- ✅ **New Student Registration Flow:** Full user registration $\to$ 6-digit OTP generation $\to$ OTP verification $\to$ Account activation $\to$ JWT Login.
- ✅ **Static Page Delivery:** Landing page, Role selector, and all 3 Portal Dashboards return HTTP 200.
