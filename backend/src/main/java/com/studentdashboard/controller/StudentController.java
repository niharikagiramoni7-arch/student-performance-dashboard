package com.studentdashboard.controller;

import com.studentdashboard.config.UserPrincipal;
import com.studentdashboard.dto.AuthDtos.MessageResponse;
import com.studentdashboard.dto.StudentDtos.*;
import com.studentdashboard.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StudentDashboardDto> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(studentService.getDashboardData(principal.getId()));
    }

    @GetMapping("/profile")
    public ResponseEntity<StudentProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(studentService.getProfile(principal.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<StudentProfileDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(studentService.updateProfile(principal.getId(), req));
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ChangePasswordRequest req) {
        return ResponseEntity.ok(studentService.changePassword(principal.getId(), req));
    }

    @GetMapping("/attendance")
    public ResponseEntity<OverallAttendanceDto> getAttendance(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(studentService.getAttendance(principal.getId()));
    }

    @GetMapping("/marks")
    public ResponseEntity<List<MarkRecordDto>> getMarks(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(studentService.getMarks(principal.getId()));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<AssignmentDto>> getAssignments(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(studentService.getAssignments(principal.getId()));
    }

    @PostMapping("/assignments/{id}/submit")
    public ResponseEntity<MessageResponse> submitAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long assignmentId,
            @RequestBody SubmitAssignmentRequest req) {
        return ResponseEntity.ok(studentService.submitAssignment(principal.getId(), assignmentId, req));
    }

    @GetMapping("/cgpa")
    public ResponseEntity<Map<String, Object>> getCgpa(@AuthenticationPrincipal UserPrincipal principal) {
        StudentProfileDto p = studentService.getProfile(principal.getId());
        return ResponseEntity.ok(Map.of("currentCgpa", p.getCurrentCgpa() != null ? p.getCurrentCgpa() : BigDecimal.ZERO));
    }

    @GetMapping("/performance")
    public ResponseEntity<StudentDashboardDto> getPerformance(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(studentService.getDashboardData(principal.getId()));
    }
}
