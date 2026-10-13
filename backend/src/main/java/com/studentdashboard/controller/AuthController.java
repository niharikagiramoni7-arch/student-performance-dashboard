package com.studentdashboard.controller;

import com.studentdashboard.dto.AuthDtos.*;
import com.studentdashboard.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "Student Performance Dashboard API"));
    }

    @GetMapping("/auth/admin-email")
    public ResponseEntity<Map<String, String>> getAdminEmail() {
        return ResponseEntity.ok(Map.of("adminEmail", authService.getAuthorizedAdminEmail()));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/auth/verify-otp")
    public ResponseEntity<MessageResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest req) {
        return ResponseEntity.ok(authService.verifyOtp(req));
    }

    @PostMapping("/auth/resend-otp")
    public ResponseEntity<MessageResponse> resendOtp(@Valid @RequestBody ResendOtpRequest req) {
        return ResponseEntity.ok(authService.resendOtp(req.getEmail()));
    }

    @GetMapping("/auth/current-otp")
    public ResponseEntity<java.util.Map<String, Object>> getCurrentOtp(@RequestParam("email") String email) {
        return ResponseEntity.ok(authService.getCurrentOtp(email));
    }

    @PostMapping("/auth/instant-activate")
    public ResponseEntity<MessageResponse> instantActivate(@RequestParam("email") String email) {
        return ResponseEntity.ok(authService.instantActivate(email));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/auth/verify-login-otp")
    public ResponseEntity<AuthResponse> verifyLoginOtp(@Valid @RequestBody VerifyLoginOtpRequest req) {
        return ResponseEntity.ok(authService.verifyLoginOtp(req));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<MessageResponse> logout() {
        return ResponseEntity.ok(MessageResponse.ok("Logout successful. Client token cleared."));
    }
}
