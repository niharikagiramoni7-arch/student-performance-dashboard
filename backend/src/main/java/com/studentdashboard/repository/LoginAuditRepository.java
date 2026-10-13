package com.studentdashboard.repository;

import com.studentdashboard.entity.LoginAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoginAuditRepository extends JpaRepository<LoginAudit, Long> {

    Page<LoginAudit> findAllByOrderByLoginTimeDesc(Pageable pageable);

    Page<LoginAudit> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCaseOrderByLoginTimeDesc(
            String email, String fullName, Pageable pageable);

    List<LoginAudit> findTop20ByOrderByLoginTimeDesc();

    long countByStatus(String status);
}
