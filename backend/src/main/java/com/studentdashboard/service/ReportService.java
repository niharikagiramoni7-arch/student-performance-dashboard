package com.studentdashboard.service;

import com.studentdashboard.dto.AdminDtos.ReportDataDto;
import com.studentdashboard.dto.AdminDtos.ReportFilterRequest;
import com.studentdashboard.entity.*;
import com.studentdashboard.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final SemesterPerformanceRepository semesterPerformanceRepository;

    public ReportService(
            StudentRepository studentRepository,
            AttendanceRepository attendanceRepository,
            MarkRepository markRepository,
            AssignmentRepository assignmentRepository,
            AssignmentSubmissionRepository submissionRepository,
            SemesterPerformanceRepository semesterPerformanceRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.markRepository = markRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.semesterPerformanceRepository = semesterPerformanceRepository;
    }

    @Transactional(readOnly = true)
    public ReportDataDto generateReport(ReportFilterRequest req) {
        String type = (req.getReportType() != null) ? req.getReportType().toUpperCase() : "PERFORMANCE";
        String filterSummary = buildFilterSummary(req);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        switch (type) {
            case "ATTENDANCE":
                return generateAttendanceReport(req, timestamp, filterSummary);
            case "MARKS":
                return generateMarksReport(req, timestamp, filterSummary);
            case "CGPA":
                return generateCgpaReport(req, timestamp, filterSummary);
            case "ASSIGNMENT":
                return generateAssignmentReport(req, timestamp, filterSummary);
            case "SEMESTER":
                return generateSemesterReport(req, timestamp, filterSummary);
            case "PERFORMANCE":
            default:
                return generateStudentPerformanceReport(req, timestamp, filterSummary);
        }
    }

    private ReportDataDto generateStudentPerformanceReport(ReportFilterRequest req, String timestamp, String summary) {
        List<Student> students = filterStudents(req);
        List<String> columns = List.of("Student ID", "Full Name", "Department", "Year", "Section", "CGPA", "Attendance %", "Total Marks", "Performance Status");
        List<List<String>> rows = new ArrayList<>();

        double sumCgpa = 0.0;
        int count = 0;

        for (Student s : students) {
            long totalAtt = attendanceRepository.countByStudentId(s.getId());
            long attended = attendanceRepository.countByStudentIdAndStatus(s.getId(), AttendanceStatus.PRESENT);
            double attPct = totalAtt > 0 ? (attended * 100.0) / totalAtt : 0.0;

            List<Mark> marks = markRepository.findByStudentId(s.getId());
            double totalM = marks.stream().mapToDouble(m -> m.getTotalMarks().doubleValue()).sum();
            double avgM = marks.isEmpty() ? 0.0 : totalM / marks.size();

            double cgpa = s.getCurrentCgpa() != null ? s.getCurrentCgpa().doubleValue() : 0.0;
            sumCgpa += cgpa;
            count++;

            String status = cgpa >= 8.5 ? "Distinction" : (cgpa >= 7.0 ? "First Class" : (cgpa >= 5.0 ? "Pass" : "Remedial Needed"));

            rows.add(List.of(
                    s.getStudentId(),
                    s.getUser().getFullName(),
                    s.getDepartment(),
                    String.valueOf(s.getYear()),
                    s.getSection(),
                    String.format("%.2f", cgpa),
                    String.format("%.1f%%", attPct),
                    String.format("%.1f", avgM),
                    status
            ));
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("Total Records", rows.size());
        stats.put("Average CGPA", count > 0 ? String.format("%.2f", sumCgpa / count) : "0.00");

        return ReportDataDto.builder()
                .title("Student Comprehensive Performance Report")
                .generatedAt(timestamp)
                .filterSummary(summary)
                .columns(columns)
                .rows(rows)
                .summaryStats(stats)
                .build();
    }

    private ReportDataDto generateAttendanceReport(ReportFilterRequest req, String timestamp, String summary) {
        List<Attendance> records = attendanceRepository.filterAttendance(req.getStudentId(), null, req.getStartDate(), req.getEndDate());
        if (req.getDepartment() != null && !req.getDepartment().isBlank()) {
            records = records.stream().filter(a -> a.getStudent().getDepartment().equalsIgnoreCase(req.getDepartment())).collect(Collectors.toList());
        }

        List<String> columns = List.of("Date", "Student ID", "Student Name", "Department", "Subject Code", "Subject Name", "Status", "Marked By");
        List<List<String>> rows = new ArrayList<>();
        long presentCount = 0;

        for (Attendance a : records) {
            if (a.getStatus() == AttendanceStatus.PRESENT) presentCount++;
            rows.add(List.of(
                    a.getDate().toString(),
                    a.getStudent().getStudentId(),
                    a.getStudent().getUser().getFullName(),
                    a.getStudent().getDepartment(),
                    a.getSubject().getCode(),
                    a.getSubject().getName(),
                    a.getStatus().name(),
                    a.getMarkedBy() != null ? a.getMarkedBy().getFullName() : "Faculty"
            ));
        }

        double attPct = !rows.isEmpty() ? (presentCount * 100.0) / rows.size() : 0.0;
        Map<String, Object> stats = new HashMap<>();
        stats.put("Total Classes", rows.size());
        stats.put("Present Classes", presentCount);
        stats.put("Overall Attendance", String.format("%.1f%%", attPct));

        return ReportDataDto.builder()
                .title("Institutional Student Attendance Report")
                .generatedAt(timestamp)
                .filterSummary(summary)
                .columns(columns)
                .rows(rows)
                .summaryStats(stats)
                .build();
    }

    private ReportDataDto generateMarksReport(ReportFilterRequest req, String timestamp, String summary) {
        List<Mark> records = markRepository.filterMarks(req.getStudentId(), null, req.getSemester());
        if (req.getDepartment() != null && !req.getDepartment().isBlank()) {
            records = records.stream().filter(m -> m.getStudent().getDepartment().equalsIgnoreCase(req.getDepartment())).collect(Collectors.toList());
        }

        List<String> columns = List.of("Student ID", "Student Name", "Department", "Semester", "Subject Code", "Subject Name", "Internal (40)", "External (60)", "Total (100)", "Grade", "Grade Point");
        List<List<String>> rows = new ArrayList<>();
        double totalMarksSum = 0.0;

        for (Mark m : records) {
            totalMarksSum += m.getTotalMarks().doubleValue();
            rows.add(List.of(
                    m.getStudent().getStudentId(),
                    m.getStudent().getUser().getFullName(),
                    m.getStudent().getDepartment(),
                    String.valueOf(m.getSemester()),
                    m.getSubject().getCode(),
                    m.getSubject().getName(),
                    m.getInternalMarks().toString(),
                    m.getExternalMarks().toString(),
                    m.getTotalMarks().toString(),
                    m.getGrade(),
                    m.getGradePoint().toString()
            ));
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("Total Assessments", rows.size());
        stats.put("Average Score", !rows.isEmpty() ? String.format("%.2f", totalMarksSum / rows.size()) : "0.00");

        return ReportDataDto.builder()
                .title("Subject Marks & Grade Evaluation Report")
                .generatedAt(timestamp)
                .filterSummary(summary)
                .columns(columns)
                .rows(rows)
                .summaryStats(stats)
                .build();
    }

    private ReportDataDto generateCgpaReport(ReportFilterRequest req, String timestamp, String summary) {
        List<Student> students = filterStudents(req);
        students.sort((a, b) -> b.getCurrentCgpa().compareTo(a.getCurrentCgpa())); // Rank by CGPA

        List<String> columns = List.of("Academic Rank", "Student ID", "Student Name", "Department", "Year", "Cumulative CGPA", "Standing");
        List<List<String>> rows = new ArrayList<>();
        int rank = 1;

        for (Student s : students) {
            double cgpa = s.getCurrentCgpa() != null ? s.getCurrentCgpa().doubleValue() : 0.0;
            String standing = cgpa >= 9.0 ? "High Honors" : (cgpa >= 8.0 ? "Honors" : (cgpa >= 7.0 ? "Good" : "Satisfactory"));

            rows.add(List.of(
                    String.valueOf(rank++),
                    s.getStudentId(),
                    s.getUser().getFullName(),
                    s.getDepartment(),
                    String.valueOf(s.getYear()),
                    String.format("%.2f", cgpa),
                    standing
            ));
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("Total Ranked Students", rows.size());
        stats.put("Top CGPA", !rows.isEmpty() ? rows.get(0).get(5) : "N/A");

        return ReportDataDto.builder()
                .title("Student CGPA & Merit Ranking Report")
                .generatedAt(timestamp)
                .filterSummary(summary)
                .columns(columns)
                .rows(rows)
                .summaryStats(stats)
                .build();
    }

    private ReportDataDto generateAssignmentReport(ReportFilterRequest req, String timestamp, String summary) {
        List<AssignmentSubmission> subs = submissionRepository.findAll();
        if (req.getStudentId() != null) {
            subs = subs.stream().filter(s -> s.getStudent().getId().equals(req.getStudentId())).collect(Collectors.toList());
        }
        if (req.getDepartment() != null && !req.getDepartment().isBlank()) {
            subs = subs.stream().filter(s -> s.getStudent().getDepartment().equalsIgnoreCase(req.getDepartment())).collect(Collectors.toList());
        }

        List<String> columns = List.of("Assignment Title", "Subject", "Student ID", "Student Name", "Due Date", "Submission Date", "Status", "Score", "Evaluator Feedback");
        List<List<String>> rows = new ArrayList<>();

        for (AssignmentSubmission s : subs) {
            rows.add(List.of(
                    s.getAssignment().getTitle(),
                    s.getAssignment().getSubject().getName(),
                    s.getStudent().getStudentId(),
                    s.getStudent().getUser().getFullName(),
                    s.getAssignment().getDueDate().toString(),
                    s.getSubmissionDate() != null ? s.getSubmissionDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "Not Submitted",
                    s.getStatus().name(),
                    s.getMarksObtained() != null ? s.getMarksObtained() + " / " + s.getAssignment().getMaxMarks() : "Pending Evaluation",
                    s.getFeedback() != null ? s.getFeedback() : "-"
            ));
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("Total Submissions", rows.size());

        return ReportDataDto.builder()
                .title("Coursework & Assignment Tracking Report")
                .generatedAt(timestamp)
                .filterSummary(summary)
                .columns(columns)
                .rows(rows)
                .summaryStats(stats)
                .build();
    }

    private ReportDataDto generateSemesterReport(ReportFilterRequest req, String timestamp, String summary) {
        List<SemesterPerformance> perfs = semesterPerformanceRepository.findAll();
        if (req.getStudentId() != null) {
            perfs = perfs.stream().filter(p -> p.getStudent().getId().equals(req.getStudentId())).collect(Collectors.toList());
        }
        if (req.getDepartment() != null && !req.getDepartment().isBlank()) {
            perfs = perfs.stream().filter(p -> p.getStudent().getDepartment().equalsIgnoreCase(req.getDepartment())).collect(Collectors.toList());
        }
        if (req.getSemester() != null) {
            perfs = perfs.stream().filter(p -> p.getSemester().equals(req.getSemester())).collect(Collectors.toList());
        }

        List<String> columns = List.of("Student ID", "Student Name", "Department", "Semester", "Semester GPA", "Total Credits", "Earned Credits");
        List<List<String>> rows = new ArrayList<>();

        for (SemesterPerformance sp : perfs) {
            rows.add(List.of(
                    sp.getStudent().getStudentId(),
                    sp.getStudent().getUser().getFullName(),
                    sp.getStudent().getDepartment(),
                    "Semester " + sp.getSemester(),
                    sp.getGpa().toString(),
                    String.valueOf(sp.getTotalCredits()),
                    String.valueOf(sp.getEarnedCredits())
            ));
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("Semester Records", rows.size());

        return ReportDataDto.builder()
                .title("Semester-Wise Academic Progression Report")
                .generatedAt(timestamp)
                .filterSummary(summary)
                .columns(columns)
                .rows(rows)
                .summaryStats(stats)
                .build();
    }

    public String generateCsv(ReportDataDto report) {
        StringBuilder sb = new StringBuilder();
        sb.append("\"").append(report.getTitle()).append("\"\n");
        sb.append("\"Generated At: ").append(report.getGeneratedAt()).append("\"\n");
        sb.append("\"Filters: ").append(report.getFilterSummary().replace("\"", "\"\"")).append("\"\n\n");

        sb.append(String.join(",", report.getColumns().stream().map(c -> "\"" + c.replace("\"", "\"\"") + "\"").collect(Collectors.toList()))).append("\n");

        for (List<String> row : report.getRows()) {
            sb.append(String.join(",", row.stream().map(v -> "\"" + (v != null ? v.replace("\"", "\"\"") : "") + "\"").collect(Collectors.toList()))).append("\n");
        }

        if (report.getSummaryStats() != null && !report.getSummaryStats().isEmpty()) {
            sb.append("\n\"Summary Statistics\"\n");
            for (Map.Entry<String, Object> entry : report.getSummaryStats().entrySet()) {
                sb.append("\"").append(entry.getKey()).append("\",\"").append(entry.getValue()).append("\"\n");
            }
        }

        return sb.toString();
    }

    private List<Student> filterStudents(ReportFilterRequest req) {
        String dept = (req.getDepartment() != null && !req.getDepartment().isBlank()) ? req.getDepartment().trim() : null;
        List<Student> students = studentRepository.searchStudents(dept, req.getYear(), null, null);
        if (req.getStudentId() != null) {
            students = students.stream().filter(s -> s.getId().equals(req.getStudentId())).collect(Collectors.toList());
        }
        return students;
    }

    private String buildFilterSummary(ReportFilterRequest req) {
        List<String> parts = new ArrayList<>();
        if (req.getDepartment() != null && !req.getDepartment().isBlank()) parts.add("Department: " + req.getDepartment());
        if (req.getYear() != null) parts.add("Year: " + req.getYear());
        if (req.getSemester() != null) parts.add("Semester: " + req.getSemester());
        if (req.getStartDate() != null) parts.add("From: " + req.getStartDate());
        if (req.getEndDate() != null) parts.add("To: " + req.getEndDate());
        return parts.isEmpty() ? "All Records (Institutional Scope)" : String.join(" | ", parts);
    }
}
