package com.servexa.notification.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchNotificationRequest {
    
    @NotEmpty(message = "User IDs list cannot be empty")
    private List<String> userIds;
    
    @Valid
    private NotificationRequest notification;
}