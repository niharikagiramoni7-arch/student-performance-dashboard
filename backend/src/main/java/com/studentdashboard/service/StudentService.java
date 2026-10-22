package com.studentdashboard.service;

import com.studentdashboard.dto.AuthDtos.MessageResponse;
import com.studentdashboard.dto.StudentDtos.*;
import com.studentdashboard.entity.*;
import com.studentdashboard.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final SemesterPerformanceRepository semesterPerformanceRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final DatabaseAutoExporterService databaseAutoExporterService;

    public StudentService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            SubjectRepository subjectRepository,
            AttendanceRepository attendanceRepository,
            MarkRepository markRepository,
            AssignmentRepository assignmentRepository,
            AssignmentSubmissionRepository submissionRepository,
            SemesterPerformanceRepository semesterPerformanceRepository,
            NotificationService notificationService,
            PasswordEncoder passwordEncoder,
            DatabaseAutoExporterService databaseAutoExporterService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.attendanceRepository = attendanceRepository;
        this.markRepository = markRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.semesterPerformanceRepository = semesterPerformanceRepository;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
        this.databaseAutoExporterService = databaseAutoExporterService;
    }

    public Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User u = userRepository.findById(userId).orElse(null);
                    if (u != null && u.getRole() == Role.ROLE_ADMIN) {
                        return studentRepository.save(Student.builder()
                                .user(u)
                                .studentId("70572400000")
                                .department("Computer Science & Engineering")
                                .year(1)
                                .section("A")
                                .currentCgpa(BigDecimal.ZERO)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build());
                    }
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student record not found for user id: " + userId);
                });
    }

    @Transactional(readOnly = true)
    public StudentProfileDto getProfile(Long userId) {
        Student s = getStudentByUserId(userId);
        return mapToProfileDto(s);
    }

    @Transactional
    public StudentProfileDto updateProfile(Long userId, UpdateProfileRequest req) {
        Student s = getStudentByUserId(userId);
        User u = s.getUser();

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            String name = req.getFullName().trim();
            if (!name.matches("^[a-zA-Z\\s]{2,60}$")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid Full Name. Full name must contain only alphabetic letters and spaces (numbers and special characters are not allowed).");
            }
            u.setFullName(name);
        }
        if (req.getPhone() != null) {
            u.setPhone(req.getPhone().trim());
        }
        userRepository.save(u);

        if (req.getDepartment() != null && !req.getDepartment().isBlank()) {
            s.setDepartment(req.getDepartment().trim());
        }
        if (req.getYear() != null) {
            s.setYear(req.getYear());
        }
        if (req.getSection() != null && !req.getSection().isBlank()) {
            s.setSection(req.getSection().trim());
        }
        studentRepository.save(s);

        return mapToProfileDto(s);
    }

    @Transactional
    public MessageResponse changePassword(Long userId, ChangePasswordRequest req) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password does not match.");
        }

        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New passwords do not match.");
        }

        if (req.getNewPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters.");
        }

        u.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(u);

        notificationService.createNotification(userId, "Password Changed", "Your account password was successfully updated.", "INFO");

        return MessageResponse.ok("Password updated successfully.");
    }

    @Transactional(readOnly = true)
    public OverallAttendanceDto getAttendance(Long userId) {
        Student s = getStudentByUserId(userId);
        List<Attendance> all = attendanceRepository.findByStudentId(s.getId());
        List<Subject> subjects = subjectRepository.findByDepartment(s.getDepartment());
        if (subjects.isEmpty()) {
            subjects = subjectRepository.findAll();
        }

        long totalClasses = all.size();
        long attendedClasses = all.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long absentClasses = totalClasses - attendedClasses;
        double overallPercentage = totalClasses > 0 ? (attendedClasses * 100.0) / totalClasses : 0.0;
        overallPercentage = Math.round(overallPercentage * 10.0) / 10.0;

        List<SubjectAttendanceDto> subjectDtos = new ArrayList<>();
        for (Subject sub : subjects) {
            long subTotal = all.stream().filter(a -> a.getSubject().getId().equals(sub.getId())).count();
            long subAttended = all.stream().filter(a -> a.getSubject().getId().equals(sub.getId()) && a.getStatus() == AttendanceStatus.PRESENT).count();
            long subAbsent = subTotal - subAttended;
            double subPct = subTotal > 0 ? (subAttended * 100.0) / subTotal : 0.0;
            subPct = Math.round(subPct * 10.0) / 10.0;

            subjectDtos.add(SubjectAttendanceDto.builder()
                    .subjectId(sub.getId())
                    .subjectCode(sub.getCode())
                    .subjectName(sub.getName())
                    .totalClasses(subTotal)
                    .attendedClasses(subAttended)
                    .absentClasses(subAbsent)
                    .percentage(subPct)
                    .warning(subTotal > 0 && subPct < 75.0)
                    .build());
        }

        return OverallAttendanceDto.builder()
                .totalClasses(totalClasses)
                .attendedClasses(attendedClasses)
                .absentClasses(absentClasses)
                .percentage(overallPercentage)
                .warning(totalClasses > 0 && overallPercentage < 75.0)
                .subjectBreakdown(subjectDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public List<MarkRecordDto> getMarks(Long userId) {
        Student s = getStudentByUserId(userId);
        return markRepository.findByStudentId(s.getId()).stream()
                .map(m -> MarkRecordDto.builder()
                        .id(m.getId())
                        .subjectId(m.getSubject().getId())
                        .subjectCode(m.getSubject().getCode())
                        .subjectName(m.getSubject().getName())
                        .semester(m.getSemester())
                        .internalMarks(m.getInternalMarks())
                        .externalMarks(m.getExternalMarks())
                        .totalMarks(m.getTotalMarks())
                        .grade(m.getGrade())
                        .gradePoint(m.getGradePoint())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignments(Long userId) {
        Student s = getStudentByUserId(userId);
        List<Assignment> assignments = assignmentRepository.findAllByOrderByDueDateAsc();
        List<AssignmentSubmission> submissions = submissionRepository.findByStudentId(s.getId());
        Map<Long, AssignmentSubmission> subMap = submissions.stream()
                .collect(Collectors.toMap(sub -> sub.getAssignment().getId(), sub -> sub, (a, b) -> a));

        List<AssignmentDto> dtos = new ArrayList<>();
        for (Assignment a : assignments) {
            AssignmentSubmission sub = subMap.get(a.getId());
            String status = "PENDING";
            LocalDateTime subDate = null;
            String subText = null;
            BigDecimal marksObt = null;
            String feedback = null;

            if (sub != null) {
                status = sub.getStatus().name();
                subDate = sub.getSubmissionDate();
                subText = sub.getSubmissionText();
                marksObt = sub.getMarksObtained();
                feedback = sub.getFeedback();
            } else if (a.getDueDate().isBefore(LocalDate.now())) {
                status = "LATE";
            }

            dtos.add(AssignmentDto.builder()
                    .id(a.getId())
                    .title(a.getTitle())
                    .subjectId(a.getSubject().getId())
                    .subjectCode(a.getSubject().getCode())
                    .subjectName(a.getSubject().getName())
                    .description(a.getDescription())
                    .assignedDate(a.getAssignedDate())
                    .dueDate(a.getDueDate())
                    .maxMarks(a.getMaxMarks())
                    .submissionStatus(status)
                    .submissionDate(subDate)
                    .submissionText(subText)
                    .marksObtained(marksObt)
                    .feedback(feedback)
                    .build());
        }
        return dtos;
    }

    @Transactional
    public MessageResponse submitAssignment(Long userId, Long assignmentId, SubmitAssignmentRequest req) {
        Student s = getStudentByUserId(userId);
        Assignment a = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

        AssignmentSubmission sub = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, s.getId())
                .orElse(AssignmentSubmission.builder()
                        .assignment(a)
                        .student(s)
                        .build());

        LocalDateTime now = LocalDateTime.now();
        sub.setSubmissionDate(now);
        sub.setSubmissionText(req.getSubmissionText());
        sub.setFileUrl(req.getFileUrl());

        if (now.toLocalDate().isAfter(a.getDueDate())) {
            sub.setStatus(SubmissionStatus.LATE);
        } else {
            sub.setStatus(SubmissionStatus.SUBMITTED);
        }

        submissionRepository.save(sub);

        // Notify faculty if creator exists
        if (a.getCreatedBy() != null) {
            notificationService.createNotification(
                    a.getCreatedBy().getId(),
                    "Assignment Submission",
                    s.getUser().getFullName() + " submitted: " + a.getTitle(),
                    "INFO"
            );
        }

        // Notify student
        notificationService.createNotification(
                userId,
                "Assignment Submitted",
                "Successfully submitted: " + a.getTitle() + (sub.getStatus() == SubmissionStatus.LATE ? " (Late)" : ""),
                sub.getStatus() == SubmissionStatus.LATE ? "WARNING" : "SUCCESS"
        );

        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Assignment submitted successfully (" + sub.getStatus() + ")");
    }

    @Transactional
    public BigDecimal calculateAndUpdateCgpa(Long studentId) {
        Student s = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        List<Mark> marks = markRepository.findByStudentId(studentId);
        if (marks.isEmpty()) {
            return s.getCurrentCgpa() != null ? s.getCurrentCgpa() : BigDecimal.ZERO;
        }

        // Group by semester
        Map<Integer, List<Mark>> semMarks = marks.stream().collect(Collectors.groupingBy(Mark::getSemester));
        double totalWeightedGpa = 0.0;
        int totalSemCredits = 0;

        for (Map.Entry<Integer, List<Mark>> entry : semMarks.entrySet()) {
            int sem = entry.getKey();
            List<Mark> list = entry.getValue();

            double semPoints = 0.0;
            int semCredits = 0;
            int earnedCredits = 0;

            for (Mark m : list) {
                int cr = m.getSubject().getCredits() != null ? m.getSubject().getCredits() : 3;
                semCredits += cr;
                semPoints += (m.getGradePoint().doubleValue() * cr);
                if (m.getGradePoint().doubleValue() >= 4.0) {
                    earnedCredits += cr;
                }
            }

            double semGpaVal = semCredits > 0 ? semPoints / semCredits : 0.0;
            BigDecimal semGpa = BigDecimal.valueOf(semGpaVal).setScale(2, RoundingMode.HALF_UP);

            SemesterPerformance perf = semesterPerformanceRepository.findByStudentIdAndSemester(studentId, sem)
                    .orElse(SemesterPerformance.builder()
                            .student(s)
                            .semester(sem)
                            .build());
            perf.setGpa(semGpa);
            perf.setTotalCredits(semCredits);
            perf.setEarnedCredits(earnedCredits);
            semesterPerformanceRepository.save(perf);

            totalWeightedGpa += semPoints;
            totalSemCredits += semCredits;
        }

        double cumulative = totalSemCredits > 0 ? totalWeightedGpa / totalSemCredits : 0.0;
        BigDecimal cgpa = BigDecimal.valueOf(cumulative).setScale(2, RoundingMode.HALF_UP);
        s.setCurrentCgpa(cgpa);
        studentRepository.save(s);
        return cgpa;
    }

    @Transactional(readOnly = true)
    public StudentDashboardDto getDashboardData(Long userId) {
        Student s = getStudentByUserId(userId);
        StudentProfileDto profile = mapToProfileDto(s);
        OverallAttendanceDto attendance = getAttendance(userId);
        List<MarkRecordDto> marks = getMarks(userId);
        List<AssignmentDto> assignments = getAssignments(userId);

        long pendingAssignments = assignments.stream()
                .filter(a -> "PENDING".equalsIgnoreCase(a.getSubmissionStatus()) || "LATE".equalsIgnoreCase(a.getSubmissionStatus()))
                .count();

        List<SemesterGpaDto> gpaHistory = semesterPerformanceRepository.findByStudentIdOrderBySemesterAsc(s.getId()).stream()
                .map(sp -> SemesterGpaDto.builder()
                        .semester(sp.getSemester())
                        .gpa(sp.getGpa())
                        .totalCredits(sp.getTotalCredits())
                        .earnedCredits(sp.getEarnedCredits())
                        .build())
                .collect(Collectors.toList());

        // Academic Strengths and Areas for Improvement
        List<String> strengths = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        for (MarkRecordDto m : marks) {
            if ("A+".equals(m.getGrade()) || "A".equals(m.getGrade()) || m.getTotalMarks().doubleValue() >= 80.0) {
                strengths.add("Strong mastery in " + m.getSubjectName() + " (Grade " + m.getGrade() + ", " + m.getTotalMarks() + "%)");
            } else if ("F".equals(m.getGrade()) || "P".equals(m.getGrade()) || m.getTotalMarks().doubleValue() < 60.0) {
                improvements.add("Low score in " + m.getSubjectName() + " (" + m.getTotalMarks() + "% - Grade " + m.getGrade() + "). Remedial study suggested.");
            }
        }

        if (attendance.getPercentage() >= 85.0) {
            strengths.add("Exceptional overall attendance: " + attendance.getPercentage() + "%");
        } else if (attendance.getPercentage() < 75.0) {
            improvements.add("Low overall attendance (" + attendance.getPercentage() + "%). Minimum 75% required to avoid detention.");
        }

        for (SubjectAttendanceDto sa : attendance.getSubjectBreakdown()) {
            if (sa.getTotalClasses() > 0 && sa.getPercentage() < 75.0) {
                improvements.add("Attendance alert: " + sa.getSubjectName() + " attendance is at " + sa.getPercentage() + "%.");
            }
        }

        if (pendingAssignments > 0) {
            improvements.add("You have " + pendingAssignments + " pending or overdue assignment(s). Submit on time to prevent grade penalties.");
        } else if (!assignments.isEmpty()) {
            strengths.add("All assigned academic coursework and submissions are up to date.");
        }

        if (strengths.isEmpty()) {
            strengths.add("Consistent attendance and coursework participation.");
        }
        if (improvements.isEmpty()) {
            improvements.add("Maintain consistent performance and prepare for upcoming assessments.");
        }

        List<NoticeDto> notices = getNotices(userId);

        return StudentDashboardDto.builder()
                .profile(profile)
                .currentCgpa(s.getCurrentCgpa() != null ? s.getCurrentCgpa() : BigDecimal.ZERO)
                .attendance(attendance)
                .totalSubjects(attendance.getSubjectBreakdown().size())
                .pendingAssignments((int) pendingAssignments)
                .recentMarks(marks)
                .recentAssignments(assignments)
                .notices(notices)
                .semesterGpaHistory(gpaHistory)
                .academicStrengths(strengths)
                .areasForImprovement(improvements)
                .build();
    }

    @Transactional(readOnly = true)
    public List<NoticeDto> getNotices(Long userId) {
        return notificationService.getUserNotifications(userId).stream()
                .map(n -> NoticeDto.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .type(n.getType())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private StudentProfileDto mapToProfileDto(Student s) {
        return StudentProfileDto.builder()
                .id(s.getId())
                .userId(s.getUser().getId())
                .studentId(s.getStudentId())
                .fullName(s.getUser().getFullName())
                .email(s.getUser().getEmail())
                .phone(s.getUser().getPhone())
                .department(s.getDepartment())
                .year(s.getYear())
                .section(s.getSection())
                .currentCgpa(s.getCurrentCgpa())
                .build();
    }
}
