package com.studentdashboard.service;

import com.studentdashboard.entity.*;
import com.studentdashboard.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class DatabaseAutoExporterService {

    private static final Logger log = LoggerFactory.getLogger(DatabaseAutoExporterService.class);

    private final UserRepository userRepository;
    private final LoginAuditRepository loginAuditRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;

    private final AtomicBoolean dirty = new AtomicBoolean(true);

    public DatabaseAutoExporterService(
            UserRepository userRepository,
            LoginAuditRepository loginAuditRepository,
            DepartmentRepository departmentRepository,
            SubjectRepository subjectRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            AttendanceRepository attendanceRepository,
            MarkRepository markRepository,
            AssignmentRepository assignmentRepository,
            AssignmentSubmissionRepository submissionRepository) {
        this.userRepository = userRepository;
        this.loginAuditRepository = loginAuditRepository;
        this.departmentRepository = departmentRepository;
        this.subjectRepository = subjectRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.attendanceRepository = attendanceRepository;
        this.markRepository = markRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
    }

    public void markDirty() {
        dirty.set(true);
    }

    @Scheduled(fixedDelay = 3000)
    public void scheduledSync() {
        if (dirty.getAndSet(false)) {
            exportDatabase();
        }
    }

    @Async
    public void exportAsync() {
        dirty.set(true);
        exportDatabase();
    }

    @Transactional(readOnly = true)
    public synchronized void exportDatabase() {
        try {
            StringBuilder sb = new StringBuilder();
            String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            sb.append("-- ======================================================\n");
            sb.append("-- CURRENT LIVE DATABASE EXPORT\n");
            sb.append("-- Generated on ").append(now).append(" (Live Auto-Sync)\n");
            sb.append("-- ======================================================\n\n");
            sb.append("USE student_performance_db;\n\n");

            // 1. Users
            List<User> users = userRepository.findAll();
            sb.append("-- 1. USERS TABLE (").append(users.size()).append(" records stored):\n");
            if (!users.isEmpty()) {
                sb.append("INSERT INTO users (id, email, full_name, phone, role, status) VALUES\n");
                for (int i = 0; i < users.size(); i++) {
                    User u = users.get(i);
                    sb.append("  (")
                            .append(u.getId()).append(", ")
                            .append(sqlStr(u.getEmail())).append(", ")
                            .append(sqlStr(u.getFullName())).append(", ")
                            .append(sqlStr(u.getPhone())).append(", ")
                            .append(sqlStr(u.getRole() != null ? u.getRole().name() : null)).append(", ")
                            .append(sqlStr(u.getStatus() != null ? u.getStatus().name() : null))
                            .append(")");
                    if (i < users.size() - 1) {
                        sb.append(",\n");
                    } else {
                        sb.append(";\n\n");
                    }
                }
            } else {
                sb.append("-- (empty)\n\n");
            }

            // 2. Login Audits
            List<LoginAudit> audits = loginAuditRepository.findAll();
            sb.append("-- 2. LOGIN AUDIT LOGS TABLE (").append(audits.size()).append(" records stored):\n");
            if (!audits.isEmpty()) {
                sb.append("INSERT INTO login_audits (id, user_id, email, full_name, role, ip_address, status, remarks, login_time) VALUES\n");
                for (int i = 0; i < audits.size(); i++) {
                    LoginAudit a = audits.get(i);
                    sb.append("  (")
                            .append(a.getId()).append(", ")
                            .append(a.getUserId() != null ? a.getUserId() : "NULL").append(", ")
                            .append(sqlStr(a.getEmail())).append(", ")
                            .append(sqlStr(a.getFullName())).append(", ")
                            .append(sqlStr(a.getRole())).append(", ")
                            .append(sqlStr(a.getIpAddress())).append(", ")
                            .append(sqlStr(a.getStatus())).append(", ")
                            .append(sqlStr(a.getRemarks())).append(", ")
                            .append(sqlStr(a.getLoginTime() != null ? a.getLoginTime().toString() : null))
                            .append(")");
                    if (i < audits.size() - 1) {
                        sb.append(",\n");
                    } else {
                        sb.append(";\n\n");
                    }
                }
            } else {
                sb.append("-- (empty)\n\n");
            }

            // 3. Departments
            List<Department> depts = departmentRepository.findAll();
            sb.append("-- 3. DEPARTMENTS TABLE (").append(depts.size()).append(" records stored):\n");
            if (!depts.isEmpty()) {
                sb.append("INSERT INTO departments (id, code, name) VALUES\n");
                for (int i = 0; i < depts.size(); i++) {
                    Department d = depts.get(i);
                    sb.append("  (")
                            .append(d.getId()).append(", ")
                            .append(sqlStr(d.getCode())).append(", ")
                            .append(sqlStr(d.getName()))
                            .append(")");
                    if (i < depts.size() - 1) {
                        sb.append(",\n");
                    } else {
                        sb.append(";\n\n");
                    }
                }
            } else {
                sb.append("-- (empty)\n\n");
            }

            // 4. Subjects
            List<Subject> subjects = subjectRepository.findAll();
            sb.append("-- 4. SUBJECTS TABLE (").append(subjects.size()).append(" records stored):\n");
            if (!subjects.isEmpty()) {
                sb.append("INSERT INTO subjects (id, code, name, department, credits, semester) VALUES\n");
                for (int i = 0; i < subjects.size(); i++) {
                    Subject s = subjects.get(i);
                    sb.append("  (")
                            .append(s.getId()).append(", ")
                            .append(sqlStr(s.getCode())).append(", ")
                            .append(sqlStr(s.getName())).append(", ")
                            .append(sqlStr(s.getDepartment())).append(", ")
                            .append(s.getCredits()).append(", ")
                            .append(s.getSemester())
                            .append(")");
                    if (i < subjects.size() - 1) {
                        sb.append(",\n");
                    } else {
                        sb.append(";\n\n");
                    }
                }
            } else {
                sb.append("-- (empty)\n\n");
            }

            // 5. Students
            List<Student> students = studentRepository.findAll();
            sb.append("-- 5. STUDENTS TABLE (").append(students.size()).append(" records stored):\n");
            if (!students.isEmpty()) {
                sb.append("INSERT INTO students (id, user_id, student_id, department, study_year, section, current_cgpa) VALUES\n");
                for (int i = 0; i < students.size(); i++) {
                    Student st = students.get(i);
                    sb.append("  (")
                            .append(st.getId()).append(", ")
                            .append(st.getUser() != null ? st.getUser().getId() : "NULL").append(", ")
                            .append(sqlStr(st.getStudentId())).append(", ")
                            .append(sqlStr(st.getDepartment())).append(", ")
                            .append(st.getYear()).append(", ")
                            .append(sqlStr(st.getSection())).append(", ")
                            .append(st.getCurrentCgpa() != null ? st.getCurrentCgpa() : "0.00")
                            .append(")");
                    if (i < students.size() - 1) {
                        sb.append(",\n");
                    } else {
                        sb.append(";\n\n");
                    }
                }
            } else {
                sb.append("-- (empty)\n\n");
            }

            // 6. Faculty
            List<Faculty> faculties = facultyRepository.findAll();
            sb.append("-- 6. FACULTY TABLE (").append(faculties.size()).append(" records stored):\n");
            if (!faculties.isEmpty()) {
                sb.append("INSERT INTO faculty (id, user_id, employee_id, department, designation) VALUES\n");
                for (int i = 0; i < faculties.size(); i++) {
                    Faculty f = faculties.get(i);
                    sb.append("  (")
                            .append(f.getId()).append(", ")
                            .append(f.getUser() != null ? f.getUser().getId() : "NULL").append(", ")
                            .append(sqlStr(f.getEmployeeId())).append(", ")
                            .append(sqlStr(f.getDepartment())).append(", ")
                            .append(sqlStr(f.getDesignation()))
                            .append(")");
                    if (i < faculties.size() - 1) {
                        sb.append(",\n");
                    } else {
                        sb.append(";\n\n");
                    }
                }
            } else {
                sb.append("-- (empty)\n\n");
            }

            // 7. Attendance
            List<Attendance> attendances = attendanceRepository.findAll();
            sb.append("-- 7. ATTENDANCE TABLE (").append(attendances.size()).append(" records stored):\n");
            if (!attendances.isEmpty()) {
                sb.append("INSERT INTO attendance (id, student_id, subject_id, attendance_date, status) VALUES\n");
                for (int i = 0; i < attendances.size(); i++) {
                    Attendance att = attendances.get(i);
                    sb.append("  (")
                            .append(att.getId()).append(", ")
                            .append(att.getStudent() != null ? att.getStudent().getId() : "NULL").append(", ")
                            .append(att.getSubject() != null ? att.getSubject().getId() : "NULL").append(", ")
                            .append(sqlStr(att.getDate() != null ? att.getDate().toString() : null)).append(", ")
                            .append(sqlStr(att.getStatus() != null ? att.getStatus().name() : null))
                            .append(")");
                    if (i < attendances.size() - 1) {
                        sb.append(",\n");
                    } else {
                        sb.append(";\n\n");
                    }
                }
            } else {
                sb.append("-- (empty)\n\n");
            }

            // 8. Marks
            List<Mark> marks = markRepository.findAll();
            sb.append("-- 8. MARKS TABLE (").append(marks.size()).append(" records stored):\n");
            if (!marks.isEmpty()) {
                sb.append("INSERT INTO marks (id, student_id, subject_id, semester, internal_marks, external_marks, total_marks, grade, grade_point) VALUES\n");
                for (int i = 0; i < marks.size(); i++) {
                    Mark m = marks.get(i);
                    sb.append("  (")
                            .append(m.getId()).append(", ")
                            .append(m.getStudent() != null ? m.getStudent().getId() : "NULL").append(", ")
                            .append(m.getSubject() != null ? m.getSubject().getId() : "NULL").append(", ")
                            .append(m.getSemester()).append(", ")
                            .append(m.getInternalMarks()).append(", ")
                            .append(m.getExternalMarks()).append(", ")
                            .append(m.getTotalMarks()).append(", ")
                            .append(sqlStr(m.getGrade())).append(", ")
                            .append(m.getGradePoint())
                            .append(")");
                    if (i < marks.size() - 1) {
                        sb.append(",\n");
                    } else {
                        sb.append(";\n\n");
                    }
                }
            } else {
                sb.append("-- (empty)\n\n");
            }

            // 9. Assignments
            List<Assignment> assignments = assignmentRepository.findAll();
            sb.append("-- 9. ASSIGNMENTS TABLE (").append(assignments.size()).append(" records stored):\n");
            if (!assignments.isEmpty()) {
                sb.append("INSERT INTO assignments (id, title, description, subject_id, assigned_date, due_date, max_marks) VALUES\n");
                for (int i = 0; i < assignments.size(); i++) {
                    Assignment as = assignments.get(i);
                    sb.append("  (")
                            .append(as.getId()).append(", ")
                            .append(sqlStr(as.getTitle())).append(", ")
                            .append(sqlStr(as.getDescription())).append(", ")
                            .append(as.getSubject() != null ? as.getSubject().getId() : "NULL").append(", ")
                            .append(sqlStr(as.getAssignedDate() != null ? as.getAssignedDate().toString() : null)).append(", ")
                            .append(sqlStr(as.getDueDate() != null ? as.getDueDate().toString() : null)).append(", ")
                            .append(as.getMaxMarks())
                            .append(")");
                    if (i < assignments.size() - 1) {
                        sb.append(",\n");
                    } else {
                        sb.append(";\n\n");
                    }
                }
            } else {
                sb.append("-- (empty)\n\n");
            }

            // 10. Assignment Submissions
            List<AssignmentSubmission> submissions = submissionRepository.findAll();
            sb.append("-- 10. ASSIGNMENT SUBMISSIONS TABLE (").append(submissions.size()).append(" records stored):\n");
            if (!submissions.isEmpty()) {
                sb.append("INSERT INTO assignment_submissions (id, assignment_id, student_id, submission_date, submission_text, file_url, marks_obtained, feedback, status) VALUES\n");
                for (int i = 0; i < submissions.size(); i++) {
                    AssignmentSubmission sub = submissions.get(i);
                    sb.append("  (")
                            .append(sub.getId()).append(", ")
                            .append(sub.getAssignment() != null ? sub.getAssignment().getId() : "NULL").append(", ")
                            .append(sub.getStudent() != null ? sub.getStudent().getId() : "NULL").append(", ")
                            .append(sqlStr(sub.getSubmissionDate() != null ? sub.getSubmissionDate().toString() : null)).append(", ")
                            .append(sqlStr(sub.getSubmissionText())).append(", ")
                            .append(sqlStr(sub.getFileUrl())).append(", ")
                            .append(sub.getMarksObtained() != null ? sub.getMarksObtained() : "NULL").append(", ")
                            .append(sqlStr(sub.getFeedback())).append(", ")
                            .append(sqlStr(sub.getStatus() != null ? sub.getStatus().name() : null))
                            .append(")");
                    if (i < submissions.size() - 1) {
                        sb.append(",\n");
                    } else {
                        sb.append(";\n\n");
                    }
                }
            } else {
                sb.append("-- (empty)\n\n");
            }

            byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);

            // Write to candidate paths
            List<Path> targets = List.of(
                    Paths.get("database", "current_database_export.sql"),
                    Paths.get("..", "database", "current_database_export.sql"),
                    Paths.get("C:\\Users\\giram\\Downloads\\student-performance-dashboard\\database\\current_database_export.sql"),
                    Paths.get("database", "seed.sql"),
                    Paths.get("..", "database", "seed.sql"),
                    Paths.get("C:\\Users\\giram\\Downloads\\student-performance-dashboard\\database\\seed.sql")
            );

            for (Path p : targets) {
                try {
                    Path parent = p.getParent();
                    if (parent != null && Files.exists(parent)) {
                        Files.write(p, bytes);
                    }
                } catch (Exception ignored) {}
            }

        } catch (Exception e) {
            log.error("Failed to auto-export live database: {}", e.getMessage());
        }
    }

    private String sqlStr(String val) {
        if (val == null) return "NULL";
        return "'" + val.replace("'", "''") + "'";
    }
}
