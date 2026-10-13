package com.studentdashboard.controller;

import com.studentdashboard.config.UserPrincipal;
import com.studentdashboard.dto.AuthDtos.MessageResponse;
import com.studentdashboard.dto.FacultyDtos.*;
import com.studentdashboard.dto.StudentDtos.ChangePasswordRequest;
import com.studentdashboard.service.FacultyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin(origins = "*")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<FacultyDashboardDto> getDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(facultyService.getDashboardData(principal.getId()));
    }

    @GetMapping("/profile")
    public ResponseEntity<FacultyProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(facultyService.getProfile(principal.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<FacultyProfileDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody FacultyProfileDto req) {
        return ResponseEntity.ok(facultyService.updateProfile(principal.getId(), req));
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ChangePasswordRequest req) {
        return ResponseEntity.ok(facultyService.changePassword(principal.getId(), req));
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentListItemDto>> getStudents(
            @RequestParam(name = "department", required = false) String department,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "section", required = false) String section,
            @RequestParam(name = "search", required = false) String search) {
        return ResponseEntity.ok(facultyService.getStudents(department, year, section, search));
    }

    @PostMapping("/attendance")
    public ResponseEntity<MessageResponse> markAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody MarkAttendanceRequest req) {
        return ResponseEntity.ok(facultyService.markAttendance(principal.getId(), req));
    }

    @PostMapping("/marks")
    public ResponseEntity<MessageResponse> saveMarks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody SaveMarkRequest req) {
        return ResponseEntity.ok(facultyService.saveMarks(principal.getId(), req));
    }

    @DeleteMapping("/marks/{id}")
    public ResponseEntity<MessageResponse> deleteMark(@PathVariable("id") Long markId) {
        return ResponseEntity.ok(facultyService.deleteMark(markId));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<java.util.Map<String, Object>>> getAssignments(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(facultyService.getFacultyAssignments(principal.getId()));
    }

    @PostMapping("/assignments")
    public ResponseEntity<MessageResponse> createAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CreateAssignmentRequest req) {
        return ResponseEntity.ok(facultyService.createAssignment(principal.getId(), req));
    }

    @PutMapping("/assignments/{id}")
    public ResponseEntity<MessageResponse> updateAssignment(
            @PathVariable("id") Long assignmentId,
            @RequestBody CreateAssignmentRequest req) {
        return ResponseEntity.ok(facultyService.updateAssignment(assignmentId, req));
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<MessageResponse> deleteAssignment(@PathVariable("id") Long assignmentId) {
        return ResponseEntity.ok(facultyService.deleteAssignment(assignmentId));
    }

    @GetMapping("/submissions")
    public ResponseEntity<List<SubmissionItemDto>> getSubmissions(
            @RequestParam(name = "assignmentId", required = false) Long assignmentId) {
        return ResponseEntity.ok(facultyService.getSubmissions(assignmentId));
    }

    @PostMapping("/submissions/{id}/grade")
    public ResponseEntity<MessageResponse> gradeSubmission(
            @PathVariable("id") Long submissionId,
            @RequestBody GradeSubmissionRequest req) {
        return ResponseEntity.ok(facultyService.gradeSubmission(submissionId, req));
    }

    @PostMapping("/notices")
    public ResponseEntity<MessageResponse> postClassNotice(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ClassNoticeRequest req) {
        return ResponseEntity.ok(facultyService.postClassNotice(principal.getId(), req));
    }
}
