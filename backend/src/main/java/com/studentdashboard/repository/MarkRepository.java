package com.studentdashboard.repository;

import com.studentdashboard.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudentId(Long studentId);
    List<Mark> findByStudentIdAndSemester(Long studentId, Integer semester);
    Optional<Mark> findByStudentIdAndSubjectIdAndSemester(Long studentId, Long subjectId, Integer semester);

    @Query("SELECT m FROM Mark m WHERE " +
           "(:studentId IS NULL OR m.student.id = :studentId) AND " +
           "(:subjectId IS NULL OR m.subject.id = :subjectId) AND " +
           "(:semester IS NULL OR m.semester = :semester)")
    List<Mark> filterMarks(
            @Param("studentId") Long studentId,
            @Param("subjectId") Long subjectId,
            @Param("semester") Integer semester);
}
