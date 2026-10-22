package com.studentdashboard.service;

import com.studentdashboard.dto.AuthDtos.MessageResponse;
import com.studentdashboard.dto.FacultyDtos.*;
import com.studentdashboard.dto.StudentDtos.ChangePasswordRequest;
import com.studentdashboard.entity.*;
import com.studentdashboard.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.data.domain.Sort;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final StudentService studentService;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final DatabaseAutoExporterService databaseAutoExporterService;

    public FacultyService(
            UserRepository userRepository,
            FacultyRepository facultyRepository,
            StudentRepository studentRepository,
            SubjectRepository subjectRepository,
            AttendanceRepository attendanceRepository,
            MarkRepository markRepository,
            AssignmentRepository assignmentRepository,
            AssignmentSubmissionRepository submissionRepository,
            StudentService studentService,
            NotificationService notificationService,
            PasswordEncoder passwordEncoder,
            DatabaseAutoExporterService databaseAutoExporterService) {
        this.userRepository = userRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.attendanceRepository = attendanceRepository;
        this.markRepository = markRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.studentService = studentService;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
        this.databaseAutoExporterService = databaseAutoExporterService;
    }

    public Faculty getFacultyByUserId(Long userId) {
        return facultyRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User u = userRepository.findById(userId).orElse(null);
                    if (u != null && (u.getRole() == Role.ROLE_FACULTY || u.getRole() == Role.ROLE_ADMIN)) {
                        String empId = (u.getRole() == Role.ROLE_ADMIN) ? "A000" : ("A" + String.format("%03d", (System.currentTimeMillis() % 1000)));
                        Faculty autoF = Faculty.builder()
                                .user(u)
                                .employeeId(empId)
                                .department("Computer Science & Engineering")
                                .designation(u.getRole() == Role.ROLE_ADMIN ? "Dean / Administrator" : "Assistant Professor")
                                .createdAt(LocalDateTime.now())
                                .build();
                        return facultyRepository.save(autoF);
                    }
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty record not found for user: " + userId);
                });
    }

    @Transactional(readOnly = true)
    public FacultyProfileDto getProfile(Long userId) {
        Faculty f = getFacultyByUserId(userId);
        return FacultyProfileDto.builder()
                .id(f.getId())
                .userId(f.getUser().getId())
                .employeeId(f.getEmployeeId())
                .fullName(f.getUser().getFullName())
                .email(f.getUser().getEmail())
                .phone(f.getUser().getPhone())
                .department(f.getDepartment())
                .designation(f.getDesignation())
                .build();
    }

    @Transactional
    public FacultyProfileDto updateProfile(Long userId, FacultyProfileDto req) {
        Faculty f = getFacultyByUserId(userId);
        User u = f.getUser();

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

        if (req.getDesignation() != null && !req.getDesignation().isBlank()) {
            f.setDesignation(req.getDesignation().trim());
        }
        if (req.getDepartment() != null && !req.getDepartment().isBlank()) {
            f.setDepartment(req.getDepartment().trim());
        }
        facultyRepository.save(f);

        return getProfile(userId);
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

        notificationService.createNotification(userId, "Password Changed", "Your faculty portal password was updated.", "INFO");

        return MessageResponse.ok("Password updated successfully.");
    }

    @Transactional(readOnly = true)
    public List<StudentListItemDto> getStudents(String department, Integer year, String section, String search) {
        String dept = (department != null && !department.isBlank()) ? department.trim() : null;
        String sec = (section != null && !section.isBlank()) ? section.trim() : null;
        String q = (search != null && !search.isBlank()) ? search.trim() : null;

        List<Student> students = studentRepository.searchStudents(dept, year, sec, q);
        List<StudentListItemDto> result = new ArrayList<>();

        for (Student s : students) {
            long total = attendanceRepository.countByStudentId(s.getId());
            long attended = attendanceRepository.countByStudentIdAndStatus(s.getId(), AttendanceStatus.PRESENT);
            double pct = total > 0 ? (attended * 100.0) / total : 0.0;
            pct = Math.round(pct * 10.0) / 10.0;

            result.add(StudentListItemDto.builder()
                    .id(s.getId())
                    .userId(s.getUser().getId())
                    .studentId(s.getStudentId())
                    .fullName(s.getUser().getFullName())
                    .email(s.getUser().getEmail())
                    .phone(s.getUser().getPhone())
                    .department(s.getDepartment())
                    .year(s.getYear())
                    .section(s.getSection())
                    .currentCgpa(s.getCurrentCgpa() != null ? s.getCurrentCgpa() : BigDecimal.ZERO)
                    .attendancePercentage(pct)
                    .build());
        }
        return result;
    }

    @Transactional
    public MessageResponse markAttendance(Long facultyUserId, MarkAttendanceRequest req) {
        User facultyUser = userRepository.findById(facultyUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty user not found"));

        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found with ID: " + req.getStudentId()));

        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found with ID: " + req.getSubjectId()));

        AttendanceStatus status;
        try {
            status = AttendanceStatus.valueOf(req.getStatus().toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid attendance status. Must be PRESENT or ABSENT");
        }

        LocalDate date = req.getDate() != null ? req.getDate() : LocalDate.now();

        Attendance attendance = attendanceRepository.findByStudentIdAndSubjectIdAndDate(student.getId(), subject.getId(), date)
                .orElse(Attendance.builder()
                        .student(student)
                        .subject(subject)
                        .date(date)
                        .build());

        attendance.setStatus(status);
        attendance.setMarkedBy(facultyUser);
        attendanceRepository.save(attendance);

        // Check if student's attendance dropped low to notify
        long total = attendanceRepository.countByStudentId(student.getId());
        long attended = attendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.PRESENT);
        if (total >= 4) {
            double pct = (attended * 100.0) / total;
            if (pct < 75.0 && status == AttendanceStatus.ABSENT) {
                notificationService.createNotification(
                        student.getUser().getId(),
                        "Attendance Warning",
                        "Your attendance has dropped to " + String.format("%.1f", pct) + "% in " + subject.getName() + ". Maintain at least 75%.",
                        "WARNING"
                );
            }
        }

        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Attendance recorded successfully for " + student.getUser().getFullName() + " (" + status + ").");
    }

    @Transactional
    public MessageResponse saveMarks(Long facultyUserId, SaveMarkRequest req) {
        User facultyUser = userRepository.findById(facultyUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty user not found"));

        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found with ID: " + req.getStudentId()));

        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found with ID: " + req.getSubjectId()));

        if (req.getInternalMarks() == null || req.getInternalMarks().compareTo(BigDecimal.ZERO) < 0 || req.getInternalMarks().compareTo(BigDecimal.valueOf(40)) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Internal marks must be between 0 and 40.");
        }

        if (req.getExternalMarks() == null || req.getExternalMarks().compareTo(BigDecimal.ZERO) < 0 || req.getExternalMarks().compareTo(BigDecimal.valueOf(60)) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "External marks must be between 0 and 60.");
        }

        Integer sem = req.getSemester() != null ? req.getSemester() : subject.getSemester();

        Mark mark = markRepository.findByStudentIdAndSubjectIdAndSemester(student.getId(), subject.getId(), sem)
                .orElse(Mark.builder()
                        .student(student)
                        .subject(subject)
                        .semester(sem)
                        .build());

        mark.setInternalMarks(req.getInternalMarks());
        mark.setExternalMarks(req.getExternalMarks());
        mark.setUpdatedBy(facultyUser);
        mark.calculateTotalAndGrade(); // sets totalMarks, grade, gradePoint
        markRepository.save(mark);

        // Recalculate CGPA for the student automatically
        BigDecimal newCgpa = studentService.calculateAndUpdateCgpa(student.getId());

        // Notify student
        notificationService.createNotification(
                student.getUser().getId(),
                "Marks Updated",
                "Marks updated for " + subject.getName() + ": Total " + mark.getTotalMarks() + "/100 (Grade " + mark.getGrade() + "). New CGPA: " + newCgpa,
                "SUCCESS"
        );

        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Marks saved successfully! Total: " + mark.getTotalMarks() + ", Grade: " + mark.getGrade() + ", Student CGPA updated to " + newCgpa);
    }

    @Transactional
    public MessageResponse deleteMark(Long markId) {
        Mark mark = markRepository.findById(markId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mark record not found"));

        Long studentId = mark.getStudent().getId();
        markRepository.delete(mark);
        studentService.calculateAndUpdateCgpa(studentId);

        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Mark record deleted successfully.");
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFacultyAssignments(Long facultyUserId) {
        Faculty f = facultyRepository.findByUserId(facultyUserId).orElse(null);
        List<Assignment> assignments;
        if (f != null && f.getDepartment() != null) {
            assignments = assignmentRepository.findAll(Sort.by(Sort.Direction.DESC, "dueDate")).stream()
                    .filter(a -> a.getSubject() != null && (f.getDepartment().equalsIgnoreCase(a.getSubject().getDepartment()) || (a.getCreatedBy() != null && a.getCreatedBy().getId().equals(facultyUserId))))
                    .collect(Collectors.toList());
            if (assignments.isEmpty()) {
                assignments = assignmentRepository.findAll(Sort.by(Sort.Direction.DESC, "dueDate"));
            }
        } else {
            assignments = assignmentRepository.findAll(Sort.by(Sort.Direction.DESC, "dueDate"));
        }

        return assignments.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("title", a.getTitle());
            map.put("description", a.getDescription() != null ? a.getDescription() : "");
            map.put("subjectId", a.getSubject() != null ? a.getSubject().getId() : null);
            map.put("subjectCode", a.getSubject() != null ? a.getSubject().getCode() : "N/A");
            map.put("subjectName", a.getSubject() != null ? a.getSubject().getName() : "N/A");
            map.put("department", a.getSubject() != null ? a.getSubject().getDepartment() : "N/A");
            map.put("assignedDate", a.getAssignedDate() != null ? a.getAssignedDate().toString() : "");
            map.put("dueDate", a.getDueDate() != null ? a.getDueDate().toString() : "");
            map.put("maxMarks", a.getMaxMarks() != null ? a.getMaxMarks() : BigDecimal.valueOf(100.0));
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse createAssignment(Long facultyUserId, CreateAssignmentRequest req) {
        User facultyUser = userRepository.findById(facultyUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty user not found"));

        if (req.getTitle() == null || req.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignment title is required.");
        }

        if (req.getSubjectId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select a valid course subject.");
        }

        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found with ID: " + req.getSubjectId()));

        if (req.getDueDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Due date is required.");
        }

        BigDecimal maxMarks = req.getMaxMarks();
        if (maxMarks == null || maxMarks.compareTo(BigDecimal.ZERO) <= 0) {
            maxMarks = BigDecimal.valueOf(100.0);
        }

        LocalDate assignedDate = req.getAssignedDate() != null ? req.getAssignedDate() : LocalDate.now();

        Assignment assignment = Assignment.builder()
                .title(req.getTitle().trim())
                .subject(subject)
                .description(req.getDescription())
                .assignedDate(assignedDate)
                .dueDate(req.getDueDate())
                .maxMarks(maxMarks)
                .createdBy(facultyUser)
                .createdAt(LocalDateTime.now())
                .build();
        assignmentRepository.save(assignment);

        // Notify students in that department safely
        try {
            List<Student> students = studentRepository.searchStudents(subject.getDepartment(), null, null, null);
            if (students.isEmpty()) {
                students = studentRepository.findAll();
            }
            for (Student s : students) {
                if (s != null && s.getUser() != null) {
                    notificationService.createNotification(
                            s.getUser().getId(),
                            "New Assignment: " + assignment.getTitle(),
                            "New coursework assigned in " + subject.getName() + " (" + subject.getCode() + "): '" + assignment.getTitle() + "' due on " + assignment.getDueDate() + " (Max Marks: " + assignment.getMaxMarks() + ").",
                            "INFO"
                    );
                }
            }
        } catch (Exception ignored) {}

        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Assignment '" + assignment.getTitle() + "' created successfully!");
    }

    @Transactional
    public MessageResponse updateAssignment(Long assignmentId, CreateAssignmentRequest req) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

        if (req.getTitle() != null && !req.getTitle().isBlank()) {
            assignment.setTitle(req.getTitle().trim());
        }
        if (req.getDescription() != null) {
            assignment.setDescription(req.getDescription());
        }
        if (req.getDueDate() != null) {
            assignment.setDueDate(req.getDueDate());
        }
        if (req.getMaxMarks() != null) {
            assignment.setMaxMarks(req.getMaxMarks());
        }
        assignmentRepository.save(assignment);
        databaseAutoExporterService.exportAsync();

        return MessageResponse.ok("Assignment updated successfully.");
    }

    @Transactional
    public MessageResponse deleteAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        assignmentRepository.delete(assignment);
        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Assignment deleted successfully.");
    }

    @Transactional(readOnly = true)
    public List<SubmissionItemDto> getSubmissions(Long assignmentId) {
        List<AssignmentSubmission> subs = (assignmentId != null) ?
                submissionRepository.findByAssignmentId(assignmentId) :
                submissionRepository.findAll();

        return subs.stream().map(s -> SubmissionItemDto.builder()
                .id(s.getId())
                .assignmentId(s.getAssignment().getId())
                .assignmentTitle(s.getAssignment().getTitle())
                .subjectId(s.getAssignment().getSubject().getId())
                .subjectCode(s.getAssignment().getSubject().getCode())
                .subjectName(s.getAssignment().getSubject().getName())
                .studentId(s.getStudent().getId())
                .studentName(s.getStudent().getUser().getFullName())
                .studentCode(s.getStudent().getStudentId())
                .submissionDate(s.getSubmissionDate())
                .status(s.getStatus().name())
                .submissionText(s.getSubmissionText())
                .fileUrl(s.getFileUrl())
                .marksObtained(s.getMarksObtained())
                .maxMarks(s.getAssignment().getMaxMarks())
                .feedback(s.getFeedback())
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse gradeSubmission(Long submissionId, GradeSubmissionRequest req) {
        AssignmentSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission record not found"));

        if (req.getMarksObtained() != null) {
            if (req.getMarksObtained().compareTo(BigDecimal.ZERO) < 0 || req.getMarksObtained().compareTo(sub.getAssignment().getMaxMarks()) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Marks must be between 0 and " + sub.getAssignment().getMaxMarks());
            }
            sub.setMarksObtained(req.getMarksObtained());
        }
        if (req.getFeedback() != null) {
            sub.setFeedback(req.getFeedback().trim());
        }
        submissionRepository.save(sub);

        notificationService.createNotification(
                sub.getStudent().getUser().getId(),
                "Assignment Graded",
                "Your submission for '" + sub.getAssignment().getTitle() + "' was graded: " + sub.getMarksObtained() + "/" + sub.getAssignment().getMaxMarks(),
                "SUCCESS"
        );

        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Submission evaluated successfully.");
    }

    @Transactional(readOnly = true)
    public FacultyDashboardDto getDashboardData(Long userId) {
        Faculty f = getFacultyByUserId(userId);
        List<Subject> subjects = subjectRepository.findByDepartment(f.getDepartment());
        if (subjects.isEmpty()) {
            subjects = subjectRepository.findAll();
        }

        List<Student> students = studentRepository.searchStudents(f.getDepartment(), null, null, null);
        if (students.isEmpty()) {
            students = studentRepository.findAll();
        }

        long totalAttendanceRecords = attendanceRepository.count();
        long presentCount = attendanceRepository.findAll().stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        double avgAttendance = totalAttendanceRecords > 0 ? (presentCount * 100.0) / totalAttendanceRecords : 80.0;
        avgAttendance = Math.round(avgAttendance * 10.0) / 10.0;

        List<Mark> marks = markRepository.findAll();
        double avgMarks = marks.stream().mapToDouble(m -> m.getTotalMarks().doubleValue()).average().orElse(78.5);
        avgMarks = Math.round(avgMarks * 10.0) / 10.0;

        List<SubmissionItemDto> recentSubs = getSubmissions(null).stream().limit(8).collect(Collectors.toList());

        List<SubjectItemDto> subjectDtos = subjects.stream()
                .map(sub -> SubjectItemDto.builder()
                        .id(sub.getId())
                        .code(sub.getCode())
                        .name(sub.getName())
                        .department(sub.getDepartment())
                        .credits(sub.getCredits())
                        .semester(sub.getSemester())
                        .build())
                .collect(Collectors.toList());

        return FacultyDashboardDto.builder()
                .profile(getProfile(userId))
                .totalStudents(students.size())
                .totalSubjects(subjects.size())
                .averageAttendance(avgAttendance)
                .averageMarks(avgMarks)
                .recentSubmissions(recentSubs)
                .subjects(subjectDtos)
                .build();
    }

    @Transactional
    public MessageResponse postClassNotice(Long facultyUserId, ClassNoticeRequest req) {
        Faculty f = getFacultyByUserId(facultyUserId);
        List<Student> students = studentRepository.searchStudents(f.getDepartment(), req.getYear(), req.getSection(), null);
        if (students.isEmpty()) {
            students = studentRepository.findAll();
        }

        for (Student s : students) {
            notificationService.createNotification(
                    s.getUser().getId(),
                    "Class Notice: " + req.getTitle(),
                    req.getMessage() + " (Posted by: " + f.getUser().getFullName() + ", Dept: " + f.getDepartment() + ")",
                    req.getType() != null ? req.getType() : "INFO"
            );
        }
        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Class notice published to " + students.size() + " student(s).");
    }
}
