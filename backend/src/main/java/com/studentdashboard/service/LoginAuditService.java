package com.studentdashboard.service;

import com.studentdashboard.entity.LoginAudit;
import com.studentdashboard.repository.LoginAuditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginAuditService {

    private final LoginAuditRepository loginAuditRepository;
    private final DatabaseAutoExporterService databaseAutoExporterService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordAudit(Long userId, String email, String fullName, String role, String ipAddress, String userAgent, String status, String remarks) {
        try {
            loginAuditRepository.save(LoginAudit.builder()
                    .userId(userId)
                    .email(email)
                    .fullName(fullName)
                    .role(role)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .status(status)
                    .remarks(remarks)
                    .loginTime(LocalDateTime.now())
                    .build());
            databaseAutoExporterService.exportAsync();
        } catch (Exception e) {
            log.error("Failed to record login audit: {}", e.getMessage());
        }
    }
}
