package com.studentdashboard.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class FacultyDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FacultyProfileDto {
        private Long id;
        private Long userId;
        private String employeeId;
        private String fullName;
        private String email;
        private String phone;
        private String department;
        private String designation;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentListItemDto {
        private Long id;
        private Long userId;
        private String studentId;
        private String fullName;
        private String email;
        private String phone;
        private String department;
        private Integer year;
        private String section;
        private BigDecimal currentCgpa;
        private double attendancePercentage;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkAttendanceRequest {
        private Long studentId;
        private Long subjectId;
        private LocalDate date;
        private String status; // PRESENT, ABSENT
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SingleAttendanceItem {
        private Long studentId;
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchAttendanceRequest {
        private Long subjectId;
        private LocalDate date;
        private List<SingleAttendanceItem> items;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaveMarkRequest {
        private Long studentId;
        private Long subjectId;
        private Integer semester;
        private BigDecimal internalMarks; // <= 40
        private BigDecimal externalMarks; // <= 60
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateAssignmentRequest {
        private String title;
        private Long subjectId;
        private String description;
        private LocalDate assignedDate;
        private LocalDate dueDate;
        private BigDecimal maxMarks = BigDecimal.valueOf(100.0);
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmissionItemDto {
        private Long id;
        private Long assignmentId;
        private String assignmentTitle;
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private Long studentId;
        private String studentName;
        private String studentCode;
        private LocalDateTime submissionDate;
        private String status;
        private String submissionText;
        private String fileUrl;
        private BigDecimal marksObtained;
        private BigDecimal maxMarks;
        private String feedback;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GradeSubmissionRequest {
        private BigDecimal marksObtained;
        private String feedback;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FacultyDashboardDto {
        private FacultyProfileDto profile;
        private long totalStudents;
        private long totalSubjects;
        private double averageAttendance;
        private double averageMarks;
        private List<SubmissionItemDto> recentSubmissions;
        private List<SubjectItemDto> subjects;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubjectItemDto {
        private Long id;
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
    public static class ClassNoticeRequest {
        private String title;
        private String message;
        private Integer year;
        private String section;
        private String type; // INFO, WARNING, SUCCESS
    }
}
