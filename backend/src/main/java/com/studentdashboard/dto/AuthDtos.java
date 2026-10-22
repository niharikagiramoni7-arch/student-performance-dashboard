package com.studentdashboard.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

public class AuthDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        @Pattern(regexp = "^[a-zA-Z\\s]{2,60}$", message = "Full name must only contain alphabetic letters and spaces (numbers and special characters are not allowed)")
        private String fullName;

        private String studentId; // required for student
        private String employeeId; // required for faculty/admin

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;

        private String department;

        @Builder.Default
        private String role = "ROLE_STUDENT"; // ROLE_STUDENT, ROLE_FACULTY, ROLE_ADMIN

        @Builder.Default
        private Integer year = 1;
        @Builder.Default
        private String section = "A";

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Confirm password is required")
        private String confirmPassword;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        private String role; // optional role hint
        private String otp;  // optional OTP if completing verification
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyLoginOtpRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "OTP is required")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        private String otp;

        private String role;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OtpVerifyRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;

        @NotBlank(message = "OTP is required")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        private String otp;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResendOtpRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private Long id;
        private String email;
        private String fullName;
        private String role;
        private String studentId;
        private String employeeId;
        private String department;
        private String message;
        @Builder.Default
        private boolean requiresOtp = false;
        @com.fasterxml.jackson.annotation.JsonIgnore
        private String otp;
        private Boolean emailSent;
        private java.time.LocalDateTime lastLoginAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MessageResponse {
        private boolean success;
        private String message;
        private Object data;

        public static MessageResponse ok(String msg) {
            return new MessageResponse(true, msg, null);
        }

        public static MessageResponse ok(String msg, Object data) {
            return new MessageResponse(true, msg, data);
        }

        public static MessageResponse error(String msg) {
            return new MessageResponse(false, msg, null);
        }
    }
}
