package com.studentdashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "semester_performance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "semester"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private Integer semester;

    @Column(precision = 4, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal gpa = BigDecimal.ZERO;

    @Column(name = "total_credits", nullable = false)
    @Builder.Default
    private Integer totalCredits = 0;

    @Column(name = "earned_credits", nullable = false)
    @Builder.Default
    private Integer earnedCredits = 0;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
