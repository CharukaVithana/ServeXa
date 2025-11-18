package com.servexa.notification.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.servexa.common.dto.ApiResponse;
import com.servexa.notification.dto.NotificationPreferenceRequest;
import com.servexa.notification.dto.NotificationPreferenceResponse;
import com.servexa.notification.service.NotificationPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/notifications/preferences")
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferenceController {
    
    private final NotificationPreferenceService preferenceService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Value("${services.auth-service.url:http://localhost:8081}")
    private String authServiceUrl;
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> getMyPreferences(
            @RequestHeader("Authorization") String authorization) {
        try {
            Long userId = getUserIdFromAuth(authorization);
            NotificationPreferenceResponse response = preferenceService.getPreferences(userId);
            return ResponseEntity.ok(ApiResponse.success(response, "Preferences retrieved successfully"));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting preferences", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve preferences"));
        }
    }
    
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> updateMyPreferences(
            @RequestHeader("Authorization") String authorization,
            @RequestBody NotificationPreferenceRequest request) {
        try {
            Long userId = getUserIdFromAuth(authorization);
            NotificationPreferenceResponse response = preferenceService.updatePreferences(userId, request);
            return ResponseEntity.ok(ApiResponse.success(response, "Preferences updated successfully"));
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating preferences", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update preferences"));
        }
    }
    
    private Long getUserIdFromAuth(String authorization) throws UnauthorizedException {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid authorization header");
        }
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authorization);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    authServiceUrl + "/api/auth/me",
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new UnauthorizedException("Invalid authentication token");
            }
            
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode data = root.path("data");
            Long userId = data.path("id").asLong();
            
            if (userId == 0) {
                throw new UnauthorizedException("User ID not found in auth response");
            }
            
            return userId;
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new UnauthorizedException("Invalid authentication token");
            }
            throw new RuntimeException("Auth service error", e);
        } catch (Exception e) {
            log.error("Error validating auth token", e);
            throw new RuntimeException("Failed to validate authentication", e);
        }
    }
    
    private static class UnauthorizedException extends Exception {
        public UnauthorizedException(String message) {
            super(message);
        }
    }
}