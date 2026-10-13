package com.studentdashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_audits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(length = 120)
    private String fullName;

    @Column(length = 40)
    private String role;

    @Column(length = 60)
    private String ipAddress;

    @Column(length = 255)
    private String userAgent;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime loginTime = LocalDateTime.now();

    @Column(nullable = false, length = 50)
    private String status; // SUCCESS, OTP_CHALLENGED, FAILED_CREDENTIALS, FAILED_INACTIVE, FAILED_INVALID_OTP

    @Column(length = 255)
    private String remarks;
}
