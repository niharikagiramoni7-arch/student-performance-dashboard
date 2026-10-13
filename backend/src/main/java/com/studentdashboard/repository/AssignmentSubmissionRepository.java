package com.studentdashboard.repository;

import com.studentdashboard.entity.AssignmentSubmission;
import com.studentdashboard.entity.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    List<AssignmentSubmission> findByStudentId(Long studentId);
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);
    long countByStudentIdAndStatus(Long studentId, SubmissionStatus status);

    @Query("SELECT s FROM AssignmentSubmission s WHERE " +
           "(:assignmentId IS NULL OR s.assignment.id = :assignmentId) AND " +
           "(:studentId IS NULL OR s.student.id = :studentId) AND " +
           "(:status IS NULL OR s.status = :status)")
    List<AssignmentSubmission> filterSubmissions(
            @Param("assignmentId") Long assignmentId,
            @Param("studentId") Long studentId,
            @Param("status") SubmissionStatus status);
}
