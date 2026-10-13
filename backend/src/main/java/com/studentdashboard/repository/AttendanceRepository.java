package com.studentdashboard.repository;

import com.studentdashboard.entity.Attendance;
import com.studentdashboard.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    Optional<Attendance> findByStudentIdAndSubjectIdAndDate(Long studentId, Long subjectId, LocalDate date);
    
    long countByStudentIdAndSubjectId(Long studentId, Long subjectId);
    long countByStudentIdAndSubjectIdAndStatus(Long studentId, Long subjectId, AttendanceStatus status);

    long countByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);

    @Query("SELECT a FROM Attendance a WHERE " +
           "(:studentId IS NULL OR a.student.id = :studentId) AND " +
           "(:subjectId IS NULL OR a.subject.id = :subjectId) AND " +
           "(:startDate IS NULL OR a.date >= :startDate) AND " +
           "(:endDate IS NULL OR a.date <= :endDate) ORDER BY a.date DESC")
    List<Attendance> filterAttendance(
            @Param("studentId") Long studentId,
            @Param("subjectId") Long subjectId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
