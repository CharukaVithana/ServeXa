package com.servexa.common.client;

import com.servexa.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${services.notification-service.url:http://localhost:8085}")
    private String notificationServiceUrl;
    
    public void sendNotification(String userId, String title, String message, NotificationType type) {
        sendNotification(userId, title, message, type, NotificationPriority.NORMAL, null);
    }
    
    public void sendNotification(String userId, String title, String message, 
                               NotificationType type, NotificationPriority priority,
                               Map<String, String> metadata) {
        try {
            String url = notificationServiceUrl + "/api/notifications";
            
            NotificationRequest request = NotificationRequest.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .priority(priority)
                    .metadata(metadata)
                    .build();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<NotificationRequest> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<ApiResponse> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, ApiResponse.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Notification sent successfully to user: {}", userId);
            } else {
                log.error("Failed to send notification. Status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error sending notification to user: {}", userId, e);
        }
    }
    
    @lombok.Data
    @lombok.Builder
    private static class NotificationRequest {
        private String userId;
        private String title;
        private String message;
        private NotificationType type;
        private NotificationPriority priority;
        private Map<String, String> metadata;
    }
    
    public enum NotificationType {
        APPOINTMENT_CREATED,
        APPOINTMENT_REMINDER,
        APPOINTMENT_CANCELLED,
        APPOINTMENT_UPDATED,
        VEHICLE_ADDED,
        VEHICLE_SERVICE_DUE,
        SERVICE_COMPLETED,
        PAYMENT_RECEIVED,
        PROMOTION,
        SYSTEM
    }
    
    public enum NotificationPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
}