package com.studentdashboard.controller;

import com.studentdashboard.config.UserPrincipal;
import com.studentdashboard.dto.AuthDtos.MessageResponse;
import com.studentdashboard.entity.Notification;
import com.studentdashboard.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        List<Notification> list = notificationService.getUserNotifications(principal.getId());
        long unread = notificationService.getUnreadCount(principal.getId());
        Map<String, Object> resp = new HashMap<>();
        resp.put("notifications", list);
        resp.put("unreadCount", unread);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markAsRead(@PathVariable("id") Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(MessageResponse.ok("Notification marked as read."));
    }

    @PutMapping("/read-all")
    public ResponseEntity<MessageResponse> markAllAsRead(@AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(MessageResponse.ok("All notifications marked as read."));
    }
}
