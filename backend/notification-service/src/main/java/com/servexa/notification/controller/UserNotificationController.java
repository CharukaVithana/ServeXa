package com.servexa.notification.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.servexa.common.dto.ApiResponse;
import com.servexa.common.security.JwtUtil;
import com.servexa.notification.dto.NotificationFilterRequest;
import com.servexa.notification.dto.NotificationResponse;
import com.servexa.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/api/notifications/me")
@RequiredArgsConstructor
@Slf4j
public class UserNotificationController {
    
    private final NotificationService notificationService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Value("${services.auth-service.url:http://localhost:8081}")
    private String authServiceUrl;
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getMyNotifications(
            @RequestHeader("Authorization") String authorization,
            @ModelAttribute NotificationFilterRequest filter) {
        try {
            String userId = getUserIdFromAuth(authorization);
            filter.setUserId(userId);
            
            Page<NotificationResponse> notifications = notificationService.getNotifications(filter);
            return ResponseEntity.ok(ApiResponse.success(notifications, "Notifications retrieved successfully"));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting user notifications", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve notifications"));
        }
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getMyUnreadCount(
            @RequestHeader("Authorization") String authorization) {
        try {
            String userId = getUserIdFromAuth(authorization);
            long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(ApiResponse.success(count, "Unread count retrieved"));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting unread count", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve unread count"));
        }
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @RequestHeader("Authorization") String authorization) {
        try {
            String userId = getUserIdFromAuth(authorization);
            
            // Get all unread notifications for the user
            NotificationFilterRequest filter = NotificationFilterRequest.builder()
                    .userId(userId)
                    .statuses(List.of(com.servexa.notification.model.NotificationStatus.UNREAD))
                    .size(1000) // Large size to get all
                    .build();
            
            Page<NotificationResponse> unreadNotifications = notificationService.getNotifications(filter);
            List<Long> ids = unreadNotifications.getContent().stream()
                    .map(NotificationResponse::getId)
                    .toList();
            
            if (!ids.isEmpty()) {
                notificationService.markMultipleAsRead(ids);
            }
            
            return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error marking all as read", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to mark notifications as read"));
        }
    }
    
    private String getUserIdFromAuth(String authorization) throws UnauthorizedException {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid authorization header");
        }
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authorization);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            String authUrl = authServiceUrl + "/api/auth/me";
            log.debug("Calling auth service at: {}", authUrl);
            log.debug("With Authorization header: {}", authorization.substring(0, Math.min(authorization.length(), 50)) + "...");
            
            ResponseEntity<String> response = restTemplate.exchange(
                    authUrl,
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new UnauthorizedException("Invalid authentication token");
            }
            
            log.debug("Auth response: {}", response.getBody());
            
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode data = root.path("data");
            
            // The userId field is a String in AuthResponse
            String userIdStr = null;
            if (data.has("userId")) {
                userIdStr = data.path("userId").asText();
            } else if (root.has("userId")) {
                userIdStr = root.path("userId").asText();
            }
            
            if (userIdStr == null || userIdStr.isEmpty()) {
                log.error("Could not find user ID in auth response. Response structure: {}", response.getBody());
                throw new UnauthorizedException("User ID not found in auth response");
            }
            
            return userIdStr;
        } catch (HttpClientErrorException e) {
            log.error("HTTP error calling auth service: {} - {}", e.getStatusCode(), e.getMessage());
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new UnauthorizedException("Invalid authentication token");
            }
            throw new RuntimeException("Auth service error: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error validating auth token: {}", e.getMessage(), e);
            log.error("Auth service URL: {}", authServiceUrl);
            throw new RuntimeException("Failed to validate authentication: " + e.getMessage(), e);
        }
    }
    
    private static class UnauthorizedException extends Exception {
        public UnauthorizedException(String message) {
            super(message);
        }
    }
}