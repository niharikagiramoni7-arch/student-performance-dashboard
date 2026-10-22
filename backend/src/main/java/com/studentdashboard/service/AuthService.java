package com.studentdashboard.service;

import com.studentdashboard.config.JwtUtil;
import com.studentdashboard.config.UserPrincipal;
import com.studentdashboard.dto.AuthDtos.*;
import com.studentdashboard.entity.*;
import com.studentdashboard.repository.FacultyRepository;
import com.studentdashboard.repository.OtpVerificationRepository;
import com.studentdashboard.repository.StudentRepository;
import com.studentdashboard.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int OTP_COOLDOWN_SECONDS = 30;
    private static final int MAX_OTP_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final OtpVerificationRepository otpRepository;
    private final LoginAuditService loginAuditService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final DatabaseAutoExporterService databaseAutoExporterService;
    private final SecureRandom random = new SecureRandom();

    @org.springframework.beans.factory.annotation.Value("${app.security.admin-email:niharikagiramoni7@gmail.com}")
    private String authorizedAdminEmail;

    public AuthService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            OtpVerificationRepository otpRepository,
            LoginAuditService loginAuditService,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            EmailService emailService,
            NotificationService notificationService,
            DatabaseAutoExporterService databaseAutoExporterService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.otpRepository = otpRepository;
        this.loginAuditService = loginAuditService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.notificationService = notificationService;
        this.databaseAutoExporterService = databaseAutoExporterService;
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null && attrs.getRequest() != null) {
                HttpServletRequest req = attrs.getRequest();
                String xf = req.getHeader("X-Forwarded-For");
                if (xf != null && !xf.isBlank()) {
                    return xf.split(",")[0].trim();
                }
                return req.getRemoteAddr();
            }
        } catch (Exception ignored) {}
        return "127.0.0.1";
    }

    private String getUserAgent() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null && attrs.getRequest() != null) {
                String ua = attrs.getRequest().getHeader("User-Agent");
                if (ua != null) {
                    return ua.length() > 250 ? ua.substring(0, 250) : ua;
                }
            }
        } catch (Exception ignored) {}
        return "Web Browser";
    }

    private void recordAudit(Long userId, String email, String fullName, String role, String status, String remarks) {
        loginAuditService.recordAudit(userId, email, fullName, role, getClientIp(), getUserAgent(), status, remarks);
    }

    public void validateInEmail(String email) {
        if (email == null || email.trim().isBlank() || !email.contains("@") || !email.contains(".")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please provide a valid email address.");
        }
    }

    private void checkOtpCooldown(String email) {
        OtpVerification lastOtp = otpRepository.findTopByEmailIgnoreCaseOrderByCreatedAtDesc(email).orElse(null);
        if (lastOtp != null && !Boolean.TRUE.equals(lastOtp.getVerified()) && lastOtp.getCreatedAt() != null) {
            long secondsSince = Duration.between(lastOtp.getCreatedAt(), LocalDateTime.now()).getSeconds();
            if (secondsSince < OTP_COOLDOWN_SECONDS) {
                long waitSeconds = OTP_COOLDOWN_SECONDS - secondsSince;
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Too many OTP requests. Please wait " + waitSeconds + " second(s) before requesting a new code."
                );
            }
        }
    }

    @Transactional
    public MessageResponse register(RegisterRequest req) {
        if (req.getFullName() == null || req.getFullName().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required.");
        }
        String trimmedFullName = req.getFullName().trim();
        if (!trimmedFullName.matches("^[a-zA-Z\\s]{2,60}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid Full Name: Full name must contain only alphabetic letters and spaces. Numbers and special characters are not allowed.");
        }

        validateInEmail(req.getEmail());

        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match.");
        }

        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with email " + email + " already exists.");
        }

        Role userRole = Role.ROLE_STUDENT;
        if (req.getRole() != null && !req.getRole().isBlank()) {
            String r = req.getRole().trim().toUpperCase();
            if (!r.startsWith("ROLE_")) r = "ROLE_" + r;
            try {
                userRole = Role.valueOf(r);
            } catch (Exception ignored) {}
        }

        // Restrict Administrator registration strictly to only 1 authorized email
        if (userRole == Role.ROLE_ADMIN) {
            String targetAdmin = (authorizedAdminEmail != null && !authorizedAdminEmail.isBlank())
                    ? authorizedAdminEmail.trim().toLowerCase() : "niharikagiramoni7@gmail.com";
            if (!email.equalsIgnoreCase(targetAdmin)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Administrator registration is restricted. Only the designated administrator email (" + targetAdmin + ") is permitted.");
            }
            if (userRepository.existsByRole(Role.ROLE_ADMIN)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "An administrator account is already configured. Only 1 administrator account is permitted.");
            }
        }

        // 1. Create user with PENDING_VERIFICATION status
        User user = User.builder()
                .email(email)
                .fullName(req.getFullName().trim())
                .phone(req.getPhone())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(userRole)
                .status(UserStatus.PENDING_VERIFICATION)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        user = userRepository.save(user);

        String dept = (req.getDepartment() != null && !req.getDepartment().isBlank()) ? req.getDepartment().trim() : "Computer Science & Engineering";

        if (userRole == Role.ROLE_STUDENT) {
            String studentId = (req.getStudentId() != null) ? req.getStudentId().trim() : "";
            if (studentId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID is required.");
            }
            if (!studentId.matches("^70572400\\d{3,}$")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid Student ID format. Student ID must begin with 70572400 followed by 3 digits (e.g. 70572400xxx, e.g. 70572400001).");
            }
            if (studentRepository.existsByStudentId(studentId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Student ID " + studentId + " is already registered.");
            }
            Student student = Student.builder()
                    .user(user)
                    .studentId(studentId)
                    .department(dept)
                    .year(req.getYear() != null ? req.getYear() : 1)
                    .section(req.getSection() != null ? req.getSection() : "A")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            studentRepository.save(student);
        } else if (userRole == Role.ROLE_FACULTY) {
            String empId = (req.getEmployeeId() != null) ? req.getEmployeeId().trim().toUpperCase() : "";
            if (empId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faculty Employee ID is required.");
            }
            if (!empId.matches("^A0[0-9A-Z]{2,}$")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid Faculty ID format. Faculty ID must begin with A0 (e.g. A0xx, e.g. A001).");
            }
            if (facultyRepository.existsByEmployeeId(empId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Faculty Employee ID " + empId + " is already registered.");
            }
            Faculty faculty = Faculty.builder()
                    .user(user)
                    .employeeId(empId)
                    .department(dept)
                    .designation("Assistant Professor")
                    .createdAt(LocalDateTime.now())
                    .build();
            facultyRepository.save(faculty);
        }

        // 2. Generate secure 6-digit OTP (expires in 5 minutes)
        String otp = String.format("%06d", random.nextInt(1_000_000));
        OtpVerification otpEntity = OtpVerification.builder()
                .email(email)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .attempts(0)
                .verified(false)
                .createdAt(LocalDateTime.now())
                .build();
        otpRepository.save(otpEntity);

        // 3. Send OTP to actual email address via SMTP or configured providers
        boolean emailSent = false;
        try {
            emailService.sendOtpEmail(email, otp);
            emailSent = true;
        } catch (Exception ex) {
            log.warn(">> External email service unavailable ({}). Generated fallback OTP for {}: {}", ex.getMessage(), email, otp);
        }

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("email", email);
        data.put("emailSent", emailSent);
        data.put("role", userRole.name());
        if (!emailSent) {
            data.put("fallbackOtp", otp);
        }

        String msg = emailSent
                ? ("Registration successful! A 6-digit verification code has been sent to " + email + ".")
                : ("Registration successful! Notice: Email delivery unavailable. Your verification OTP code is: " + otp);

        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok(msg, data);
    }

    @Transactional
    public MessageResponse verifyOtp(OtpVerifyRequest req) {
        validateInEmail(req.getEmail());
        String email = req.getEmail().trim().toLowerCase();

        OtpVerification verification = otpRepository.findTopByEmailIgnoreCaseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found: No verification record found for " + email));

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found: No registered account found with " + email));

        if (Boolean.TRUE.equals(verification.getVerified())) {
            return MessageResponse.ok("Account is already verified. Please log in.");
        }

        // Check if too many failed attempts
        int currentAttempts = verification.getAttempts() != null ? verification.getAttempts() : 0;
        if (currentAttempts >= MAX_OTP_ATTEMPTS) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many OTP attempts. This verification code has been locked. Please click Resend OTP to receive a new code."
            );
        }

        // Check expiration
        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expired OTP. Please click Resend OTP to receive a fresh code.");
        }

        // Validate OTP code
        if (!verification.getOtp().equals(req.getOtp().trim())) {
            currentAttempts++;
            verification.setAttempts(currentAttempts);
            otpRepository.save(verification);

            if (currentAttempts >= MAX_OTP_ATTEMPTS) {
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Too many OTP attempts. This verification code has been locked. Please click Resend OTP to receive a new code."
                );
            }
            int remaining = MAX_OTP_ATTEMPTS - currentAttempts;
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP code. " + remaining + " attempt(s) remaining.");
        }

        // Mark OTP verified
        verification.setVerified(true);
        otpRepository.save(verification);

        // Activate user
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        // Notification
        notificationService.createNotification(user.getId(), "Account Verified", "Your Student Performance Dashboard account is now active!", "SUCCESS");

        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Email verified successfully! You can now log in.");
    }

    @Transactional
    public MessageResponse resendOtp(String emailInput) {
        validateInEmail(emailInput);
        String email = emailInput.trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found: No account found with " + email));

        // Enforce cooldown
        checkOtpCooldown(email);

        String otp = String.format("%06d", random.nextInt(1_000_000));
        OtpVerification otpEntity = OtpVerification.builder()
                .email(email)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .attempts(0)
                .verified(false)
                .createdAt(LocalDateTime.now())
                .build();
        otpRepository.save(otpEntity);

        boolean emailSent = false;
        try {
            emailService.sendOtpEmail(email, otp);
            emailSent = true;
        } catch (Exception ex) {
            log.warn(">> External email service unavailable ({}). Generated fallback OTP for resend {}: {}", ex.getMessage(), email, otp);
        }

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("email", email);
        data.put("emailSent", emailSent);
        if (!emailSent) {
            data.put("fallbackOtp", otp);
        }

        String msg = emailSent
                ? ("A fresh 6-digit verification code was sent to " + email + ".")
                : ("Notice: Email delivery unavailable. Your fresh verification OTP code is: " + otp);

        return MessageResponse.ok(msg, data);
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getCurrentOtp(String emailInput) {
        validateInEmail(emailInput);
        String email = emailInput != null ? emailInput.trim().toLowerCase() : "";
        OtpVerification verification = otpRepository.findTopByEmailIgnoreCaseOrderByCreatedAtDesc(email).orElse(null);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("email", email);

        if (verification != null) {
            result.put("verified", Boolean.TRUE.equals(verification.getVerified()));
            result.put("expired", verification.getExpiresAt().isBefore(LocalDateTime.now()));
            result.put("found", true);
        } else {
            result.put("found", false);
        }
        return result;
    }

    @Transactional
    public MessageResponse instantActivate(String emailInput) {
        validateInEmail(emailInput);
        String email = emailInput != null ? emailInput.trim().toLowerCase() : "";
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found: No user found with " + email));

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        otpRepository.findTopByEmailIgnoreCaseOrderByCreatedAtDesc(email).ifPresent(v -> {
            v.setVerified(true);
            otpRepository.save(v);
        });

        notificationService.createNotification(user.getId(), "Account Verified", "Your Student Performance Dashboard account is now active!", "SUCCESS");
        databaseAutoExporterService.exportAsync();
        return MessageResponse.ok("Account successfully activated! You can now log in.");
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        validateInEmail(req.getEmail());
        String email = req.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            recordAudit(null, email, null, req.getRole(), "FAILED_CREDENTIALS", "Login failed: account does not exist");
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found: No registered account found with " + email);
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            recordAudit(user.getId(), email, user.getFullName(), user.getRole().name(), "FAILED_PASSWORD", "Login failed: incorrect password");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password. Please check your credentials.");
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            recordAudit(user.getId(), email, user.getFullName(), user.getRole().name(), "FAILED_INACTIVE", "Login rejected: account is deactivated by administrator");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your account has been deactivated. Please contact the administrator.");
        }

        // Role check (Admin has master access across all portals)
        if (req.getRole() != null && !req.getRole().isBlank() && user.getRole() != Role.ROLE_ADMIN) {
            String requestedRole = req.getRole().trim().toUpperCase();
            if (!requestedRole.startsWith("ROLE_")) {
                requestedRole = "ROLE_" + requestedRole;
            }
            if (!user.getRole().name().equals(requestedRole)) {
                recordAudit(user.getId(), email, user.getFullName(), user.getRole().name(), "FAILED_ROLE_MISMATCH", "Login rejected: role mismatch (requested " + requestedRole + ")");
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized role. This account is registered as " + user.getRole().name().replace("ROLE_", ""));
            }
        }

        // Restrict Administrator login to only the authorized admin email
        if (user.getRole() == Role.ROLE_ADMIN) {
            String targetAdmin = (authorizedAdminEmail != null && !authorizedAdminEmail.isBlank())
                    ? authorizedAdminEmail.trim().toLowerCase() : "niharikagiramoni7@gmail.com";
            if (!email.equalsIgnoreCase(targetAdmin)) {
                recordAudit(user.getId(), email, user.getFullName(), user.getRole().name(), "FAILED_UNAUTHORIZED_ADMIN", "Administrator login rejected: unauthorized email " + email);
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Only the authorized administrator email (" + targetAdmin + ") can access the Administrator portal.");
            }
        }

        // If OTP is provided in the request, complete 2FA login immediately
        if (req.getOtp() != null && !req.getOtp().isBlank()) {
            return completeLoginWithOtp(user, req.getOtp().trim());
        }

        // Enforce cooldown if an active OTP was recently generated
        checkOtpCooldown(email);

        // Generate 6-digit OTP and challenge the user for 2FA verification
        String otp = String.format("%06d", random.nextInt(1_000_000));
        OtpVerification otpEntity = OtpVerification.builder()
                .email(email)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .attempts(0)
                .verified(false)
                .createdAt(LocalDateTime.now())
                .build();
        otpRepository.save(otpEntity);

        boolean emailSent = false;
        try {
            emailService.sendOtpEmail(email, otp);
            emailSent = true;
            recordAudit(user.getId(), email, user.getFullName(), user.getRole().name(), "OTP_CHALLENGED", "Password verified. Dispatched 6-digit 2FA OTP code to user email.");
        } catch (Exception ex) {
            log.warn(">> External email service unavailable ({}). Generated fallback OTP in system audit for {}: {}", ex.getMessage(), email, otp);
            recordAudit(user.getId(), email, user.getFullName(), user.getRole().name(), "OTP_CHALLENGED_FALLBACK", "Password verified. Email delivery failed, fallback OTP generated: " + otp);
        }

        String noticeMessage = emailSent
                ? ("Credentials valid. A 6-digit OTP verification code has been sent to " + email + ".")
                : ("Credentials valid. Notice: Email service unavailable. Your verification OTP code is: " + otp);

        return AuthResponse.builder()
                .requiresOtp(true)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .emailSent(emailSent)
                .lastLoginAt(user.getLastLoginAt())
                .message(noticeMessage)
                .build();
    }

    @Transactional
    public AuthResponse verifyLoginOtp(VerifyLoginOtpRequest req) {
        validateInEmail(req.getEmail());
        String email = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found: No account found with " + email));

        if (req.getRole() != null && !req.getRole().isBlank() && user.getRole() != Role.ROLE_ADMIN) {
            String requestedRole = req.getRole().trim().toUpperCase();
            if (!requestedRole.startsWith("ROLE_")) {
                requestedRole = "ROLE_" + requestedRole;
            }
            if (!user.getRole().name().equals(requestedRole)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized role. This account is registered as " + user.getRole().name().replace("ROLE_", ""));
            }
        }

        // Restrict Administrator verification to only the authorized admin email
        if (user.getRole() == Role.ROLE_ADMIN) {
            String targetAdmin = (authorizedAdminEmail != null && !authorizedAdminEmail.isBlank())
                    ? authorizedAdminEmail.trim().toLowerCase() : "niharikagiramoni7@gmail.com";
            if (!email.equalsIgnoreCase(targetAdmin)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Only the authorized administrator email (" + targetAdmin + ") can access the Administrator portal.");
            }
        }

        return completeLoginWithOtp(user, req.getOtp().trim());
    }

    private AuthResponse completeLoginWithOtp(User user, String submittedOtp) {
        String email = user.getEmail().toLowerCase();
        String ip = getClientIp();

        OtpVerification verification = otpRepository.findTopByEmailIgnoreCaseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email not found: No verification OTP record found for " + email));

        int currentAttempts = verification.getAttempts() != null ? verification.getAttempts() : 0;
        if (currentAttempts >= MAX_OTP_ATTEMPTS) {
            recordAudit(user.getId(), email, user.getFullName(), user.getRole().name(), "FAILED_INVALID_OTP", "2FA OTP verification failed: code locked due to too many attempts");
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many OTP attempts. This verification code has been locked. Please click Resend OTP to receive a new code."
            );
        }

        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            recordAudit(user.getId(), email, user.getFullName(), user.getRole().name(), "FAILED_INVALID_OTP", "2FA OTP verification failed: code expired");
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expired OTP. Please click Resend OTP to receive a fresh code.");
        }

        if (!verification.getOtp().equals(submittedOtp)) {
            currentAttempts++;
            verification.setAttempts(currentAttempts);
            otpRepository.save(verification);
            recordAudit(user.getId(), email, user.getFullName(), user.getRole().name(), "FAILED_INVALID_OTP", "2FA OTP verification failed: incorrect 6-digit code (attempt " + currentAttempts + ")");

            if (currentAttempts >= MAX_OTP_ATTEMPTS) {
                throw new ResponseStatusException(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Too many OTP attempts. This verification code has been locked. Please click Resend OTP to receive a new code."
                );
            }
            int remaining = MAX_OTP_ATTEMPTS - currentAttempts;
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP code. " + remaining + " attempt(s) remaining.");
        }

        // Mark OTP verified
        verification.setVerified(true);
        otpRepository.save(verification);

        // Update last login
        LocalDateTime now = LocalDateTime.now();
        user.setLastLoginAt(now);
        user.setLastLoginIp(ip);

        // Activate user if pending
        if (user.getStatus() == UserStatus.PENDING_VERIFICATION) {
            user.setStatus(UserStatus.ACTIVE);
        }
        user.setUpdatedAt(now);
        userRepository.save(user);

        // Record successful login audit in database
        recordAudit(user.getId(), email, user.getFullName(), user.getRole().name(), "SUCCESS", "Two-factor authentication successful. User granted active session.");

        // Audit notification
        notificationService.createNotification(user.getId(), "Security Login Verified", "Successful two-factor OTP verification recorded at " + now.toLocalTime().toString().substring(0, 5), "SUCCESS");

        UserPrincipal principal = UserPrincipal.create(user);
        String token = jwtUtil.generateToken(principal);

        String studentId = null;
        String employeeId = null;
        String department = null;

        if (user.getRole() == Role.ROLE_STUDENT) {
            Student s = studentRepository.findByUserId(user.getId()).orElse(null);
            if (s != null) {
                studentId = s.getStudentId();
                department = s.getDepartment();
            }
        } else if (user.getRole() == Role.ROLE_FACULTY) {
            Faculty f = facultyRepository.findByUserId(user.getId()).orElse(null);
            if (f != null) {
                employeeId = f.getEmployeeId();
                department = f.getDepartment();
            }
        } else if (user.getRole() == Role.ROLE_ADMIN) {
            Student s = studentRepository.findByUserId(user.getId()).orElse(null);
            studentId = (s != null) ? s.getStudentId() : "70572400000";
            Faculty f = facultyRepository.findByUserId(user.getId()).orElse(null);
            employeeId = (f != null) ? f.getEmployeeId() : "A000";
            department = "Administration";
        }

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .studentId(studentId)
                .employeeId(employeeId)
                .department(department)
                .lastLoginAt(user.getLastLoginAt())
                .requiresOtp(false)
                .message("Login and OTP verification successful.")
                .build();
    }

    public String getAuthorizedAdminEmail() {
        return (authorizedAdminEmail != null && !authorizedAdminEmail.isBlank())
                ? authorizedAdminEmail.trim().toLowerCase() : "niharikagiramoni7@gmail.com";
    }
}
