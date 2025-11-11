package com.servexa.notification.dto;

import com.servexa.notification.model.NotificationPriority;
import com.servexa.notification.model.NotificationStatus;
import com.servexa.notification.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationStatus status;
    private NotificationPriority priority;
    private Map<String, String> metadata;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}