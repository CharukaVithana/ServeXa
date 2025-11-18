package com.servexa.notification.controller;

import com.servexa.common.dto.ApiResponse;
import com.servexa.notification.dto.*;
import com.servexa.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(
            @Valid @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.createNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Notification created successfully"));
    }
    
    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> createBatchNotifications(
            @Valid @RequestBody BatchNotificationRequest request) {
        List<NotificationResponse> responses = notificationService.createBatchNotifications(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(responses, "Batch notifications created successfully"));
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            @ModelAttribute NotificationFilterRequest filter) {
        Page<NotificationResponse> notifications = notificationService.getNotifications(filter);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Notifications retrieved successfully"));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(@PathVariable Long id) {
        NotificationResponse response = notificationService.getNotificationById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Notification retrieved successfully"));
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable Long id) {
        NotificationResponse response = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Notification marked as read"));
    }
    
    @PutMapping("/read")
    public ResponseEntity<ApiResponse<Void>> markMultipleAsRead(@RequestBody List<Long> ids) {
        notificationService.markMultipleAsRead(ids);
        return ResponseEntity.ok(ApiResponse.success(null, "Notifications marked as read"));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification deleted successfully"));
    }
    
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteMultipleNotifications(@RequestBody List<Long> ids) {
        notificationService.deleteMultipleNotifications(ids);
        return ResponseEntity.ok(ApiResponse.success(null, "Notifications deleted successfully"));
    }
    
    @GetMapping("/users/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable String userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count, "Unread count retrieved"));
    }
    
    @PostMapping("/archive-old")
    public ResponseEntity<ApiResponse<Void>> archiveOldNotifications(
            @RequestParam(defaultValue = "30") int daysOld) {
        notificationService.archiveOldNotifications(daysOld);
        return ResponseEntity.ok(ApiResponse.success(null, "Old notifications archived"));
    }
}