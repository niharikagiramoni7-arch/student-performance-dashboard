package com.studentdashboard.controller;

import com.studentdashboard.config.UserPrincipal;
import com.studentdashboard.dto.AdminDtos.*;
import com.studentdashboard.dto.AuthDtos.MessageResponse;
import com.studentdashboard.dto.StudentDtos.ChangePasswordRequest;
import com.studentdashboard.entity.Department;
import com.studentdashboard.entity.Subject;
import com.studentdashboard.service.AdminService;
import com.studentdashboard.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final ReportService reportService;

    public AdminController(AdminService adminService, ReportService reportService) {
        this.adminService = adminService;
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        return ResponseEntity.ok(adminService.getStatistics());
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminService.getProfile(principal.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<MessageResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> req) {
        return ResponseEntity.ok(adminService.updateProfile(principal.getId(), req));
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ChangePasswordRequest req) {
        return ResponseEntity.ok(adminService.changePassword(principal.getId(), req));
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(name = "role", required = false) String role,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getUsersPaged(role, search, page, size));
    }

    @PostMapping("/users")
    public ResponseEntity<MessageResponse> createUser(@RequestBody CreateUserRequest req) {
        return ResponseEntity.ok(adminService.createUser(req));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<MessageResponse> updateUser(
            @PathVariable("id") Long userId,
            @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(adminService.updateUser(userId, req));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable("id") Long userId) {
        return ResponseEntity.ok(adminService.deleteUser(userId));
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getSubjects() {
        return ResponseEntity.ok(adminService.getSubjects());
    }

    @PostMapping("/subjects")
    public ResponseEntity<MessageResponse> createSubject(@RequestBody CreateSubjectRequest req) {
        return ResponseEntity.ok(adminService.createSubject(req));
    }

    @GetMapping("/statistics")
    public ResponseEntity<AdminDashboardDto> getStatistics() {
        return ResponseEntity.ok(adminService.getStatistics());
    }

    @PostMapping("/reports")
    public ResponseEntity<ReportDataDto> generateReport(@RequestBody ReportFilterRequest req) {
        return ResponseEntity.ok(reportService.generateReport(req));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<MessageResponse> setUserStatus(
            @PathVariable("id") Long userId,
            @RequestParam("status") String status) {
        return ResponseEntity.ok(adminService.setUserStatus(userId, status));
    }

    @GetMapping("/login-audits")
    public ResponseEntity<Map<String, Object>> getLoginAudits(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "15") int size) {
        return ResponseEntity.ok(adminService.getLoginAudits(search, page, size));
    }

    @GetMapping("/login-audits/export")
    public ResponseEntity<byte[]> exportLoginAudits() {
        String csv = adminService.exportLoginAuditsCsv();
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"login_audit_logs.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> getDepartments() {
        return ResponseEntity.ok(adminService.getDepartments());
    }

    @PostMapping("/departments")
    public ResponseEntity<MessageResponse> createDepartment(@RequestBody DepartmentRequest req) {
        return ResponseEntity.ok(adminService.createDepartment(req));
    }

    @PostMapping("/announcements")
    public ResponseEntity<MessageResponse> broadcastAnnouncement(@RequestBody AnnouncementRequest req) {
        return ResponseEntity.ok(adminService.broadcastAnnouncement(req));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getAllAssignments() {
        return ResponseEntity.ok(adminService.getAllAssignments());
    }

    @GetMapping("/config")
    public ResponseEntity<SystemConfigDto> getSystemConfig() {
        return ResponseEntity.ok(adminService.getSystemConfig());
    }

    @PutMapping("/config")
    public ResponseEntity<MessageResponse> updateSystemConfig(@RequestBody SystemConfigDto req) {
        return ResponseEntity.ok(adminService.updateSystemConfig(req));
    }

    @PostMapping("/reports/csv")
    public ResponseEntity<byte[]> downloadCsv(@RequestBody ReportFilterRequest req) {
        ReportDataDto report = reportService.generateReport(req);
        String csv = reportService.generateCsv(report);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);

        String filename = "report_" + (req.getReportType() != null ? req.getReportType().toLowerCase() : "performance") + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}
