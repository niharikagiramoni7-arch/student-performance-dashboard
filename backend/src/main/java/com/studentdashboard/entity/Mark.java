package com.studentdashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "subject_id", "semester"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(nullable = false)
    @Builder.Default
    private Integer semester = 1;

    @Column(name = "internal_marks", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal internalMarks = BigDecimal.ZERO;

    @Column(name = "external_marks", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal externalMarks = BigDecimal.ZERO;

    @Column(name = "total_marks", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalMarks = BigDecimal.ZERO;

    @Column(nullable = false, length = 5)
    @Builder.Default
    private String grade = "F";

    @Column(name = "grade_point", precision = 4, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal gradePoint = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    public void calculateTotalAndGrade() {
        if (internalMarks == null) internalMarks = BigDecimal.ZERO;
        if (externalMarks == null) externalMarks = BigDecimal.ZERO;
        this.totalMarks = internalMarks.add(externalMarks);

        double total = this.totalMarks.doubleValue();
        if (total >= 90) {
            this.grade = "A+";
            this.gradePoint = BigDecimal.valueOf(10.0);
        } else if (total >= 80) {
            this.grade = "A";
            this.gradePoint = BigDecimal.valueOf(9.0);
        } else if (total >= 70) {
            this.grade = "B+";
            this.gradePoint = BigDecimal.valueOf(8.0);
        } else if (total >= 60) {
            this.grade = "B";
            this.gradePoint = BigDecimal.valueOf(7.0);
        } else if (total >= 50) {
            this.grade = "C";
            this.gradePoint = BigDecimal.valueOf(6.0);
        } else if (total >= 40) {
            this.grade = "P";
            this.gradePoint = BigDecimal.valueOf(5.0);
        } else {
            this.grade = "F";
            this.gradePoint = BigDecimal.valueOf(0.0);
        }
        this.updatedAt = LocalDateTime.now();
    }
}
