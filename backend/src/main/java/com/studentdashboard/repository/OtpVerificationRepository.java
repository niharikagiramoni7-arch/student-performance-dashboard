package com.studentdashboard.repository;

import com.studentdashboard.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    void deleteByEmailIgnoreCase(String email);
}
