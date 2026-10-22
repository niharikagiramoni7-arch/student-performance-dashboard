package com.studentdashboard.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class StudentDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentProfileDto {
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
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String fullName;
        private String phone;
        private String department;
        private Integer year;
        private String section;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
        private String confirmPassword;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AttendanceRecordDto {
        private Long id;
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private LocalDate date;
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubjectAttendanceDto {
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private long totalClasses;
        private long attendedClasses;
        private long absentClasses;
        private double percentage;
        private boolean warning; // percentage < 75%
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OverallAttendanceDto {
        private long totalClasses;
        private long attendedClasses;
        private long absentClasses;
        private double percentage;
        private boolean warning;
        private List<SubjectAttendanceDto> subjectBreakdown;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MarkRecordDto {
        private Long id;
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private Integer semester;
        private BigDecimal internalMarks;
        private BigDecimal externalMarks;
        private BigDecimal totalMarks;
        private String grade;
        private BigDecimal gradePoint;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssignmentDto {
        private Long id;
        private String title;
        private Long subjectId;
        private String subjectCode;
        private String subjectName;
        private String description;
        private LocalDate assignedDate;
        private LocalDate dueDate;
        private BigDecimal maxMarks;
        private String submissionStatus; // PENDING, SUBMITTED, LATE
        private LocalDateTime submissionDate;
        private String submissionText;
        private BigDecimal marksObtained;
        private String feedback;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitAssignmentRequest {
        private String submissionText;
        private String fileUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SemesterGpaDto {
        private Integer semester;
        private BigDecimal gpa;
        private Integer totalCredits;
        private Integer earnedCredits;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NoticeDto {
        private Long id;
        private String title;
        private String message;
        private String type;
        private Boolean isRead;
        private LocalDateTime createdAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentDashboardDto {
        private StudentProfileDto profile;
        private BigDecimal currentCgpa;
        private OverallAttendanceDto attendance;
        private int totalSubjects;
        private int pendingAssignments;
        private List<MarkRecordDto> recentMarks;
        private List<AssignmentDto> recentAssignments;
        private List<NoticeDto> notices;
        private List<SemesterGpaDto> semesterGpaHistory;
        private List<String> academicStrengths;
        private List<String> areasForImprovement;
    }
}
