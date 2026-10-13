package com.studentdashboard.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AdminDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminDashboardDto {
        private long totalStudents;
        private long totalFaculty;
        private long totalSubjects;
        private double averageCgpa;
        private double averageAttendance;
        private Map<String, Long> studentsByDepartment;
        private Map<String, Double> averageCgpaByDepartment;
        private Map<String, Double> averageAttendanceByDepartment;
        private Map<Integer, Double> performanceBySemester;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserListItemDto {
        private Long id;
        private String email;
        private String fullName;
        private String role;
        private String phone;
        private String status;
        private String department;
        private String identifier; // student_id or employee_id
        private Integer year;
        private String section;
        private String designation;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserRequest {
        private String email;
        private String password;
        private String fullName;
        private String phone;
        private String role; // ROLE_STUDENT, ROLE_FACULTY, ROLE_ADMIN
        private String department;
        private String studentId;
        private Integer year = 1;
        private String section = "A";
        private String employeeId;
        private String designation = "Assistant Professor";
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserRequest {
        private String fullName;
        private String phone;
        private String department;
        private String status; // ACTIVE, INACTIVE, PENDING_VERIFICATION
        private Integer year;
        private String section;
        private String designation;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSubjectRequest {
        private String code;
        private String name;
        private String department;
        private Integer credits;
        private Integer semester;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportFilterRequest {
        private String reportType; // PERFORMANCE, ATTENDANCE, MARKS, CGPA, ASSIGNMENT, SEMESTER
        private Long studentId;
        private String department;
        private Integer year;
        private Integer semester;
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportDataDto {
        private String title;
        private String generatedAt;
        private String filterSummary;
        private List<String> columns;
        private List<List<String>> rows;
        private Map<String, Object> summaryStats;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnnouncementRequest {
        private String title;
        private String message;
        private String target; // ALL, STUDENTS, FACULTY, DEPARTMENT
        private String department;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SystemConfigDto {
        @Builder.Default
        private String institutionName = "SVKM's NMIMS University";
        @Builder.Default
        private String campus = "MPSTME, Mumbai Campus";
        @Builder.Default
        private double minAttendancePct = 75.0;
        @Builder.Default
        private String academicYear = "2026-2027";
        @Builder.Default
        private int activeSemester = 5;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DepartmentRequest {
        private String code;
        private String name;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginAuditDto {
        private Long id;
        private Long userId;
        private String email;
        private String fullName;
        private String role;
        private String ipAddress;
        private String userAgent;
        private LocalDateTime loginTime;
        private String status;
        private String remarks;
    }
}
