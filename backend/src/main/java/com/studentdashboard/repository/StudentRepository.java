package com.studentdashboard.repository;

import com.studentdashboard.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByStudentId(String studentId);
    boolean existsByStudentId(String studentId);

    @Query("SELECT s FROM Student s JOIN s.user u WHERE " +
           "(:department IS NULL OR s.department = :department) AND " +
           "(:year IS NULL OR s.year = :year) AND " +
           "(:section IS NULL OR s.section = :section) AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.studentId) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Student> searchStudents(
            @Param("department") String department,
            @Param("year") Integer year,
            @Param("section") String section,
            @Param("search") String search);

    @Query("SELECT s FROM Student s JOIN s.user u WHERE " +
           "(:department IS NULL OR s.department = :department) AND " +
           "(:year IS NULL OR s.year = :year) AND " +
           "(:section IS NULL OR s.section = :section) AND " +
           "(:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(s.studentId) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Student> searchStudentsPaged(
            @Param("department") String department,
            @Param("year") Integer year,
            @Param("section") String section,
            @Param("search") String search,
            Pageable pageable);
}
