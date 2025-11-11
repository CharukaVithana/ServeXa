package com.servexa.notification.dto;

import com.servexa.notification.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceRequest {
    private boolean emailEnabled;
    private boolean pushEnabled;
    private boolean smsEnabled;
    private Set<NotificationType> enabledTypes;
    private String quietHoursStart;
    private String quietHoursEnd;
}