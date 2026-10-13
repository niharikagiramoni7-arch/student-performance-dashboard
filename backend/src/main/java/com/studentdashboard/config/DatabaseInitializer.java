package com.studentdashboard.config;

import com.studentdashboard.entity.*;
import com.studentdashboard.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationRepository notificationRepository;
    private final OtpVerificationRepository otpRepository;
    private final MarkRepository markRepository;
    private final AttendanceRepository attendanceRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final SemesterPerformanceRepository semesterPerformanceRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.security.admin-email:niharikagiramoni7@gmail.com}")
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value("${app.security.admin-password:}")
    private String configuredAdminPassword;

    public DatabaseInitializer(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            FacultyRepository facultyRepository,
            StudentRepository studentRepository,
            SubjectRepository subjectRepository,
            NotificationRepository notificationRepository,
            OtpVerificationRepository otpRepository,
            MarkRepository markRepository,
            AttendanceRepository attendanceRepository,
            AssignmentRepository assignmentRepository,
            AssignmentSubmissionRepository submissionRepository,
            SemesterPerformanceRepository semesterPerformanceRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.notificationRepository = notificationRepository;
        this.otpRepository = otpRepository;
        this.markRepository = markRepository;
        this.attendanceRepository = attendanceRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.semesterPerformanceRepository = semesterPerformanceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        String targetAdmin = (adminEmail != null && !adminEmail.isBlank()) ? adminEmail.trim().toLowerCase() : "niharikagiramoni7@gmail.com";
        log.info(">> DatabaseInitializer starting. Authorized Administrator: {}", targetAdmin);

        // 1. Ensure baseline academic departments exist (CSE, IT, ECE)
        Department dCse = departmentRepository.findByCodeIgnoreCase("CSE").orElseGet(() ->
                departmentRepository.save(Department.builder().code("CSE").name("Computer Science & Engineering").build()));
        Department dIt = departmentRepository.findByCodeIgnoreCase("IT").orElseGet(() ->
                departmentRepository.save(Department.builder().code("IT").name("Information Technology").build()));
        Department dEce = departmentRepository.findByCodeIgnoreCase("ECE").orElseGet(() ->
                departmentRepository.save(Department.builder().code("ECE").name("Electronics & Communication Engineering").build()));

        // 2. Ensure standard subjects catalog exists
        if (subjectRepository.count() == 0) {
            subjectRepository.save(Subject.builder().code("CS301").name("Database Management Systems").department(dCse.getName()).credits(4).semester(3).build());
            subjectRepository.save(Subject.builder().code("CS302").name("Data Structures & Algorithms").department(dCse.getName()).credits(4).semester(3).build());
            subjectRepository.save(Subject.builder().code("CS303").name("Web Technologies").department(dCse.getName()).credits(3).semester(3).build());
            subjectRepository.save(Subject.builder().code("CS304").name("Operating Systems").department(dCse.getName()).credits(4).semester(3).build());

            subjectRepository.save(Subject.builder().code("IT201").name("Object Oriented Programming").department(dIt.getName()).credits(4).semester(2).build());
            subjectRepository.save(Subject.builder().code("IT202").name("Computer Networks").department(dIt.getName()).credits(3).semester(2).build());

            subjectRepository.save(Subject.builder().code("EC401").name("Digital Signal Processing").department(dEce.getName()).credits(4).semester(4).build());
            subjectRepository.save(Subject.builder().code("EC402").name("VLSI Design").department(dEce.getName()).credits(4).semester(4).build());
            log.info(">> Initialized academic subjects catalog.");
        }

        // 3. Ensure single authorized Administrator account
        User adminUser = userRepository.findByEmailIgnoreCase(targetAdmin).orElse(null);
        List<User> allAdmins = userRepository.findByRole(Role.ROLE_ADMIN);

        if (adminUser != null) {
            adminUser.setRole(Role.ROLE_ADMIN);
            adminUser.setStatus(UserStatus.ACTIVE);
            if (configuredAdminPassword != null && !configuredAdminPassword.isBlank()) {
                adminUser.setPasswordHash(passwordEncoder.encode(configuredAdminPassword.trim()));
            }
            userRepository.save(adminUser);
        } else if (!allAdmins.isEmpty()) {
            // Re-assign the primary admin to targetAdmin
            adminUser = allAdmins.get(0);
            adminUser.setEmail(targetAdmin);
            adminUser.setFullName("Institutional Administrator");
            adminUser.setStatus(UserStatus.ACTIVE);
            if (configuredAdminPassword != null && !configuredAdminPassword.isBlank()) {
                adminUser.setPasswordHash(passwordEncoder.encode(configuredAdminPassword.trim()));
            }
            userRepository.save(adminUser);
            log.info(">> Reassigned primary administrator to: {}", targetAdmin);
        } else {
            String initialPass = (configuredAdminPassword != null && !configuredAdminPassword.isBlank()) ?
                    configuredAdminPassword.trim() : "Admin@123";
            adminUser = userRepository.save(User.builder()
                    .email(targetAdmin)
                    .passwordHash(passwordEncoder.encode(initialPass))
                    .fullName("Institutional Administrator")
                    .phone("+91 9876543210")
                    .role(Role.ROLE_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .createdAt(LocalDateTime.now())
                    .build());
            log.info(">> Created primary administrator account for: {}", targetAdmin);
        }

        // Enforce: only targetAdmin can have ROLE_ADMIN. Revoke ROLE_ADMIN from any other accounts.
        final Long adminId = adminUser.getId();
        for (User u : userRepository.findAll()) {
            if (!u.getId().equals(adminId) && u.getRole() == Role.ROLE_ADMIN) {
                u.setRole(Role.ROLE_STUDENT);
                userRepository.save(u);
                log.info(">> Revoked ROLE_ADMIN from non-admin account: {}", u.getEmail());
            }
            // Purge dummy example.com accounts if any exist
            if (u.getEmail().endsWith("@example.com") && !u.getEmail().equalsIgnoreCase(targetAdmin)) {
                studentRepository.findByUserId(u.getId()).ifPresent(studentRepository::delete);
                facultyRepository.findByUserId(u.getId()).ifPresent(facultyRepository::delete);
                userRepository.delete(u);
                log.info(">> Purged example dummy account: {}", u.getEmail());
            }
        }

        // 4. Ensure Administrator has linked Faculty persona (A000)
        final User finalAdmin = adminUser;
        if (facultyRepository.findByUserId(finalAdmin.getId()).isEmpty()) {
            facultyRepository.save(Faculty.builder()
                    .user(finalAdmin)
                    .employeeId("A000")
                    .department("Computer Science & Engineering")
                    .designation("Dean / Administrator")
                    .createdAt(LocalDateTime.now())
                    .build());
            log.info(">> Linked Faculty persona (A000) created for Administrator.");
        }

        // 5. Ensure Administrator has linked Student persona (70572400000)
        if (studentRepository.findByUserId(finalAdmin.getId()).isEmpty()) {
            studentRepository.save(Student.builder()
                    .user(finalAdmin)
                    .studentId("70572400000")
                    .department("Computer Science & Engineering")
                    .year(1)
                    .section("A")
                    .currentCgpa(java.math.BigDecimal.ZERO)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
            log.info(">> Linked Student persona (70572400000) created for Administrator.");
        }

        // 6. Log active users and entities summary
        log.info("==================================================================================");
        log.info(">> INITIALIZATION COMPLETE. Administrator: {} (Full Master Access)", targetAdmin);
        log.info(">> Total Users in Database: {}", userRepository.count());
        userRepository.findAll().forEach(u ->
                log.info("   • Active User: {} ({}, ID: {})", u.getEmail(), u.getRole(), u.getId()));
        log.info(">> Total Students in Database: {}", studentRepository.count());
        log.info(">> Total Faculty in Database: {}", facultyRepository.count());
        log.info("==================================================================================");
    }
}
