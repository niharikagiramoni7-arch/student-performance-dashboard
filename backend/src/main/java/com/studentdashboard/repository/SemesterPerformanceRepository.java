package com.studentdashboard.repository;

import com.studentdashboard.entity.SemesterPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterPerformanceRepository extends JpaRepository<SemesterPerformance, Long> {
    List<SemesterPerformance> findByStudentIdOrderBySemesterAsc(Long studentId);
    Optional<SemesterPerformance> findByStudentIdAndSemester(Long studentId, Integer semester);
}
