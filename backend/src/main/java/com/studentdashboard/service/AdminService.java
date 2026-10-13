package com.studentdashboard.service;

import com.studentdashboard.dto.AdminDtos.*;
import com.studentdashboard.dto.AuthDtos.MessageResponse;
import com.studentdashboard.dto.StudentDtos.ChangePasswordRequest;
import com.studentdashboard.entity.*;
import com.studentdashboard.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;
    private final SemesterPerformanceRepository semesterPerformanceRepository;
    private final DepartmentRepository departmentRepository;
    private final LoginAuditRepository loginAuditRepository;
    private final AssignmentRepository assignmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final DatabaseAutoExporterService databaseAutoExporterService;

    // In-memory system configuration (persists across runtime, can be adjusted dynamically)
    private final SystemConfigDto systemConfig = SystemConfigDto.builder().build();

    public AdminService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            SubjectRepository subjectRepository,
            AttendanceRepository attendanceRepository,
            MarkRepository markRepository,
            SemesterPerformanceRepository semesterPerformanceRepository,
            DepartmentRepository departmentRepository,
            LoginAuditRepository loginAuditRepository,
            AssignmentRepository assignmentRepository,
            PasswordEncoder passwordEncoder,
            NotificationService notificationService,
            DatabaseAutoExporterService databaseAutoExporterService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.subjectRepository = subjectRepository;
        this.attendanceRepository = attendanceRepository;
        this.markRepository = markRepository;
        this.semesterPerformanceRepository = semesterPerformanceRepository;
        this.departmentRepository = departmentRepository;
        this.loginAuditRepository = loginAuditRepository;
        this.assignmentRepository = assignmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
        this.databaseAutoExporterService = databaseAutoExporterService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProfile(Long userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Map<String, Object> map = new HashMap<>();
        map.put("id", u.getId());
        map.put("email", u.getEmail());
        map.put("fullName", u.getFullName());
        map.put("phone", u.getPhone());
        map.put("role", u.getRole().name());
        map.put("status", u.getStatus().name());
        return map;
    }

    @Transactional
    public MessageResponse updateProfile(Long userId, Map<String, String> req) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (req.containsKey("fullName") && req.get("fullName") != null) {
            u.setFullName(req.get("fullName").trim());
        }
        if (req.containsKey("phone")) {
            u.setPhone(req.get("phone"));
        }
        userRepository.save(u);
        return MessageResponse.ok("Admin profile updated.");
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
        return MessageResponse.ok("Admin password updated successfully.");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getUsersPaged(String roleStr, String search, int page, int size) {
        Role role = null;
        if (roleStr != null && !roleStr.isBlank() && !roleStr.equalsIgnoreCase("ALL")) {
            try {
                role = Role.valueOf(roleStr.toUpperCase().startsWith("ROLE_") ? roleStr.toUpperCase() : "ROLE_" + roleStr.toUpperCase());
            } catch (Exception ignored) {}
        }
        String q = (search != null && !search.isBlank()) ? search.trim() : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<User> userPage = userRepository.searchUsers(role, q, pageable);

        List<UserListItemDto> dtos = userPage.getContent().stream().map(u -> {
            String dept = "-";
            String identifier = "-";
            Integer year = null;
            String section = null;
            String designation = null;

            if (u.getRole() == Role.ROLE_STUDENT) {
                Student s = studentRepository.findByUserId(u.getId()).orElse(null);
                if (s != null) {
                    dept = s.getDepartment();
                    identifier = s.getStudentId();
                    year = s.getYear();
                    section = s.getSection();
                }
            } else if (u.getRole() == Role.ROLE_FACULTY) {
                Faculty f = facultyRepository.findByUserId(u.getId()).orElse(null);
                if (f != null) {
                    dept = f.getDepartment();
                    identifier = f.getEmployeeId();
                    designation = f.getDesignation();
                }
            }

            return UserListItemDto.builder()
                    .id(u.getId())
                    .email(u.getEmail())
                    .fullName(u.getFullName())
                    .role(u.getRole().name())
                    .phone(u.getPhone())
                    .status(u.getStatus().name())
                    .department(dept)
                    .identifier(identifier)
                    .year(year)
                    .section(section)
                    .designation(designation)
                    .createdAt(u.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("users", dtos);
        response.put("currentPage", userPage.getNumber());
        response.put("totalItems", userPage.getTotalElements());
        response.put("totalPages", userPage.getTotalPages());
        return response;
    }

    @Transactional
    public MessageResponse createUser(CreateUserRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (!email.contains("@") || !email.contains(".")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please provide a valid email address.");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered: " + email);
        }

        Role role;
        try {
            role = Role.valueOf(req.getRole().toUpperCase().startsWith("ROLE_") ? req.getRole().toUpperCase() : "ROLE_" + req.getRole().toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + req.getRole());
        }

        if (role == Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot create additional administrator accounts. Only 1 administrator account is permitted.");
        }

        String password = (req.getPassword() != null && !req.getPassword().isBlank()) ? req.getPassword() : "Welcome@123";

        User u = User.builder()
                .email(email)
                .fullName(req.getFullName().trim())
                .phone(req.getPhone())
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        u = userRepository.save(u);

        if (role == Role.ROLE_STUDENT) {
            String sid = req.getStudentId() != null ? req.getStudentId().trim() : "";
            if (sid.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID is required.");
            }
            if (!sid.matches("^70572400\\d{3,}$")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid Student ID format. Student ID must begin with 70572400 followed by 3 digits (e.g. 70572400xxx, e.g. 70572400001).");
            }
            if (studentRepository.existsByStudentId(sid)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Student ID already exists: " + sid);
            }
            Student s = Student.builder()
                    .user(u)
                    .studentId(sid)
                    .department(req.getDepartment() != null ? req.getDepartment().trim() : "Computer Science & Engineering")
                    .year(req.getYear() != null ? req.getYear() : 1)
                    .section(req.getSection() != null ? req.getSection() : "A")
                    .currentCgpa(BigDecimal.ZERO)
                    .createdAt(LocalDateTime.now())
                    .build();
            studentRepository.save(s);
        } else if (role == Role.ROLE_FACULTY) {
            String fid = req.getEmployeeId() != null ? req.getEmployeeId().trim().toUpperCase() : "";
            if (fid.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faculty Employee ID is required.");
            }
            if (!fid.matches("^A0[0-9A-Z]{2,}$")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid Faculty ID format. Faculty ID must begin with A0 (e.g. A0xx, e.g. A001).");
            }
            if (facultyRepository.existsByEmployeeId(fid)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Faculty Employee ID already exists: " + fid);
            }
            Faculty f = Faculty.builder()
                    .user(u)
                    .employeeId(fid)
                    .department(req.getDepartment() != null ? req.getDepartment().trim() : "Computer Science & Engineering")
                    .designation(req.getDesignation() != null ? req.getDesignation().trim() : "Assistant Professor")
                    .createdAt(LocalDateTime.now())
                    .build();
            facultyRepository.save(f);
        }

        notificationService.createNotification(u.getId(), "Welcome to Student Performance Dashboard", "Your account has been created by the administrator.", "SUCCESS");

        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("User created successfully with role " + role.name());
    }

    @Transactional
    public MessageResponse updateUser(Long userId, UpdateUserRequest req) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            u.setFullName(req.getFullName().trim());
        }
        if (req.getPhone() != null) {
            u.setPhone(req.getPhone().trim());
        }
        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            try {
                u.setStatus(UserStatus.valueOf(req.getStatus().toUpperCase()));
            } catch (Exception ignored) {}
        }
        userRepository.save(u);

        if (u.getRole() == Role.ROLE_STUDENT) {
            studentRepository.findByUserId(userId).ifPresent(s -> {
                if (req.getDepartment() != null) s.setDepartment(req.getDepartment().trim());
                if (req.getYear() != null) s.setYear(req.getYear());
                if (req.getSection() != null) s.setSection(req.getSection().trim());
                studentRepository.save(s);
            });
        } else if (u.getRole() == Role.ROLE_FACULTY) {
            facultyRepository.findByUserId(userId).ifPresent(f -> {
                if (req.getDepartment() != null) f.setDepartment(req.getDepartment().trim());
                if (req.getDesignation() != null) f.setDesignation(req.getDesignation().trim());
                facultyRepository.save(f);
            });
        }

        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("User details updated successfully.");
    }

    @Transactional
    public MessageResponse deleteUser(Long userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (u.getRole() == Role.ROLE_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete the designated administrator account.");
        }
        // Soft delete / deactivation or full delete
        userRepository.delete(u);
        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("User deleted successfully.");
    }

    @Transactional(readOnly = true)
    public List<Subject> getSubjects() {
        return subjectRepository.findAll();
    }

    @Transactional
    public MessageResponse createSubject(CreateSubjectRequest req) {
        if (req.getCode() == null || req.getCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject code is required.");
        }
        if (req.getName() == null || req.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject name is required.");
        }

        Subject sub = Subject.builder()
                .code(req.getCode().trim().toUpperCase())
                .name(req.getName().trim())
                .department(req.getDepartment() != null ? req.getDepartment().trim() : "Computer Science & Engineering")
                .credits(req.getCredits() != null ? req.getCredits() : 3)
                .semester(req.getSemester() != null ? req.getSemester() : 1)
                .createdAt(LocalDateTime.now())
                .build();
        subjectRepository.save(sub);
        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Subject '" + sub.getName() + "' created.");
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getStatistics() {
        long totalStudents = studentRepository.count();
        long totalFaculty = facultyRepository.count();
        long totalSubjects = subjectRepository.count();

        List<Student> students = studentRepository.findAll();
        double avgCgpa = students.stream()
                .filter(s -> s.getCurrentCgpa() != null && s.getCurrentCgpa().compareTo(BigDecimal.ZERO) > 0)
                .mapToDouble(s -> s.getCurrentCgpa().doubleValue())
                .average()
                .orElse(8.25);
        avgCgpa = Math.round(avgCgpa * 100.0) / 100.0;

        long totalAttendance = attendanceRepository.count();
        long presentCount = attendanceRepository.findAll().stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        double avgAttendance = totalAttendance > 0 ? (presentCount * 100.0) / totalAttendance : 85.0;
        avgAttendance = Math.round(avgAttendance * 10.0) / 10.0;

        // Students by Department
        Map<String, Long> studentsByDept = students.stream()
                .collect(Collectors.groupingBy(Student::getDepartment, Collectors.counting()));

        // Average CGPA by Department
        Map<String, Double> cgpaByDept = students.stream()
                .filter(s -> s.getCurrentCgpa() != null)
                .collect(Collectors.groupingBy(
                        Student::getDepartment,
                        Collectors.averagingDouble(s -> s.getCurrentCgpa().doubleValue())
                ));
        cgpaByDept.replaceAll((k, v) -> Math.round(v * 100.0) / 100.0);

        // Performance by Semester
        List<SemesterPerformance> semPerfs = semesterPerformanceRepository.findAll();
        Map<Integer, Double> perfBySem = semPerfs.stream()
                .collect(Collectors.groupingBy(
                        SemesterPerformance::getSemester,
                        Collectors.averagingDouble(sp -> sp.getGpa().doubleValue())
                ));
        if (perfBySem.isEmpty()) {
            perfBySem.put(1, 8.2);
            perfBySem.put(2, 8.4);
            perfBySem.put(3, 8.6);
            perfBySem.put(4, 8.8);
        } else {
            perfBySem.replaceAll((k, v) -> Math.round(v * 100.0) / 100.0);
        }

        // Attendance by Department
        Map<String, Double> attByDept = new HashMap<>();
        for (String dept : studentsByDept.keySet()) {
            List<Student> deptStudents = students.stream().filter(s -> s.getDepartment().equals(dept)).collect(Collectors.toList());
            long dTotal = 0;
            long dPresent = 0;
            for (Student s : deptStudents) {
                dTotal += attendanceRepository.countByStudentId(s.getId());
                dPresent += attendanceRepository.countByStudentIdAndStatus(s.getId(), AttendanceStatus.PRESENT);
            }
            double deptPct = dTotal > 0 ? (dPresent * 100.0) / dTotal : 82.0;
            attByDept.put(dept, Math.round(deptPct * 10.0) / 10.0);
        }

        return AdminDashboardDto.builder()
                .totalStudents(totalStudents)
                .totalFaculty(totalFaculty)
                .totalSubjects(totalSubjects)
                .averageCgpa(avgCgpa)
                .averageAttendance(avgAttendance)
                .studentsByDepartment(studentsByDept)
                .averageCgpaByDepartment(cgpaByDept)
                .averageAttendanceByDepartment(attByDept)
                .performanceBySemester(perfBySem)
                .build();
    }

    @Transactional
    public MessageResponse setUserStatus(Long userId, String statusStr) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserStatus newStatus;
        try {
            newStatus = UserStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + statusStr + ". Must be ACTIVE or INACTIVE.");
        }

        u.setStatus(newStatus);
        u.setUpdatedAt(LocalDateTime.now());
        userRepository.save(u);

        String msg = "User " + u.getEmail() + " status updated to " + newStatus.name();
        notificationService.createNotification(u.getId(), "Account Status Changed", "Your account status is now " + newStatus.name(), newStatus == UserStatus.ACTIVE ? "SUCCESS" : "WARNING");
        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok(msg);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLoginAudits(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "loginTime"));
        Page<LoginAudit> auditPage;

        if (search != null && !search.isBlank()) {
            auditPage = loginAuditRepository.findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCaseOrderByLoginTimeDesc(search.trim(), search.trim(), pageable);
        } else {
            auditPage = loginAuditRepository.findAllByOrderByLoginTimeDesc(pageable);
        }

        List<LoginAuditDto> dtos = auditPage.getContent().stream().map(a -> LoginAuditDto.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .email(a.getEmail())
                .fullName(a.getFullName())
                .role(a.getRole())
                .ipAddress(a.getIpAddress())
                .userAgent(a.getUserAgent())
                .loginTime(a.getLoginTime())
                .status(a.getStatus())
                .remarks(a.getRemarks())
                .build()).collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("audits", dtos);
        resp.put("currentPage", auditPage.getNumber());
        resp.put("totalItems", auditPage.getTotalElements());
        resp.put("totalPages", auditPage.getTotalPages());
        return resp;
    }

    @Transactional(readOnly = true)
    public String exportLoginAuditsCsv() {
        List<LoginAudit> audits = loginAuditRepository.findAll(Sort.by(Sort.Direction.DESC, "loginTime"));
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Timestamp,Email,Full Name,Role,IP Address,Status,Remarks,User Agent\n");
        for (LoginAudit a : audits) {
            sb.append(a.getId()).append(",")
              .append("\"").append(a.getLoginTime()).append("\",")
              .append("\"").append(a.getEmail() != null ? a.getEmail() : "").append("\",")
              .append("\"").append(a.getFullName() != null ? a.getFullName().replace("\"", "\"\"") : "").append("\",")
              .append("\"").append(a.getRole() != null ? a.getRole() : "").append("\",")
              .append("\"").append(a.getIpAddress() != null ? a.getIpAddress() : "").append("\",")
              .append("\"").append(a.getStatus() != null ? a.getStatus() : "").append("\",")
              .append("\"").append(a.getRemarks() != null ? a.getRemarks().replace("\"", "\"\"") : "").append("\",")
              .append("\"").append(a.getUserAgent() != null ? a.getUserAgent().replace("\"", "\"\"") : "").append("\"\n");
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public List<Department> getDepartments() {
        return departmentRepository.findAll(Sort.by("name"));
    }

    @Transactional
    public MessageResponse createDepartment(DepartmentRequest req) {
        if (req.getCode() == null || req.getCode().isBlank() || req.getName() == null || req.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department code and name are required.");
        }
        String code = req.getCode().trim().toUpperCase();
        if (departmentRepository.findByCodeIgnoreCase(code).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Department with code " + code + " already exists.");
        }

        Department d = Department.builder()
                .code(code)
                .name(req.getName().trim())
                .createdAt(LocalDateTime.now())
                .build();
        departmentRepository.save(d);
        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Department " + d.getName() + " (" + d.getCode() + ") created successfully.");
    }

    @Transactional
    public MessageResponse broadcastAnnouncement(AnnouncementRequest req) {
        if (req.getTitle() == null || req.getTitle().isBlank() || req.getMessage() == null || req.getMessage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Announcement title and message are required.");
        }

        String target = req.getTarget() != null ? req.getTarget().trim().toUpperCase() : "ALL";
        List<User> recipients;

        if ("STUDENTS".equals(target)) {
            recipients = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ROLE_STUDENT).collect(Collectors.toList());
        } else if ("FACULTY".equals(target)) {
            recipients = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ROLE_FACULTY).collect(Collectors.toList());
        } else if ("DEPARTMENT".equals(target) && req.getDepartment() != null && !req.getDepartment().isBlank()) {
            List<Student> students = studentRepository.searchStudents(req.getDepartment().trim(), null, null, null);
            recipients = students.stream().map(Student::getUser).collect(Collectors.toList());
        } else {
            recipients = userRepository.findAll();
        }

        for (User u : recipients) {
            notificationService.createNotification(u.getId(), "📢 " + req.getTitle().trim(), req.getMessage().trim(), "INFO");
        }

        return MessageResponse.ok("System announcement dispatched to " + recipients.size() + " recipient(s).");
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllAssignments() {
        List<Assignment> assignments = assignmentRepository.findAll(Sort.by(Sort.Direction.DESC, "dueDate"));
        return assignments.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("title", a.getTitle());
            map.put("subjectCode", a.getSubject() != null ? a.getSubject().getCode() : "N/A");
            map.put("subjectName", a.getSubject() != null ? a.getSubject().getName() : "N/A");
            map.put("department", a.getSubject() != null ? a.getSubject().getDepartment() : "N/A");
            map.put("dueDate", a.getDueDate());
            map.put("maxMarks", a.getMaxMarks());
            map.put("createdByName", a.getCreatedBy() != null ? a.getCreatedBy().getFullName() : "Faculty");
            return map;
        }).collect(Collectors.toList());
    }

    public SystemConfigDto getSystemConfig() {
        return this.systemConfig;
    }

    public MessageResponse updateSystemConfig(SystemConfigDto req) {
        if (req.getInstitutionName() != null && !req.getInstitutionName().isBlank()) {
            this.systemConfig.setInstitutionName(req.getInstitutionName().trim());
        }
        if (req.getCampus() != null && !req.getCampus().isBlank()) {
            this.systemConfig.setCampus(req.getCampus().trim());
        }
        if (req.getMinAttendancePct() > 0 && req.getMinAttendancePct() <= 100) {
            this.systemConfig.setMinAttendancePct(req.getMinAttendancePct());
        }
        if (req.getAcademicYear() != null && !req.getAcademicYear().isBlank()) {
            this.systemConfig.setAcademicYear(req.getAcademicYear().trim());
        }
        if (req.getActiveSemester() >= 1 && req.getActiveSemester() <= 8) {
            this.systemConfig.setActiveSemester(req.getActiveSemester());
        }
        return MessageResponse.ok("System configuration updated successfully.");
    }
}
