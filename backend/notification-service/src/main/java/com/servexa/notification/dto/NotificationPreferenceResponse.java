package com.servexa.notification.dto;

import com.servexa.notification.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceResponse {
    private Long id;
    private Long userId;
    private boolean emailEnabled;
    private boolean pushEnabled;
    private boolean smsEnabled;
    private Set<NotificationType> enabledTypes;
    private String quietHoursStart;
    private String quietHoursEnd;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}