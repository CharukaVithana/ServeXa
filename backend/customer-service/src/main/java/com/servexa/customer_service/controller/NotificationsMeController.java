package com.servexa.customerservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import com.servexa.customerservice.model.Notification;
import com.servexa.customerservice.model.Customer;
import com.servexa.customerservice.service.NotificationService;
import com.servexa.customerservice.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
@Slf4j
public class NotificationsMeController {

    private final RestTemplate restTemplate;
    private final NotificationService notificationService;
    private final CustomerRepository customerRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${services.auth-service.url:http://localhost:8081}")
    private String authServiceUrl;

    public NotificationsMeController(RestTemplate restTemplate,
                                     NotificationService notificationService,
                                     CustomerRepository customerRepository) {
        this.restTemplate = restTemplate;
        this.notificationService = notificationService;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getMyNotifications(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            log.info("GET /api/notifications/me called");
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                log.warn("Missing or invalid Authorization header");
                return ResponseEntity.status(401).body(Collections.emptyList());
            }

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authorization);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Call auth service /api/auth/me to get user info
        log.info("Calling auth-service at {} to validate token", authServiceUrl + "/api/auth/me");
            ResponseEntity<String> resp = restTemplate.exchange(
                    authServiceUrl + "/api/auth/me",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                return ResponseEntity.status(401).body(Collections.emptyList());
            }

            JsonNode root = objectMapper.readTree(resp.getBody());
            JsonNode data = root.path("data");
            String email = data.path("email").asText(null);

            log.info("Auth service returned email={}", email);

            if (email == null) {
                return ResponseEntity.status(401).body(Collections.emptyList());
            }

            // Find customer by email
            Customer customer = customerRepository.findByEmail(email).orElse(null);
            if (customer != null) log.info("Found customer id={} for email={}", customer.getId(), email);
            if (customer == null) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            List<Notification> notifications = notificationService.getNotificationsByCustomer(customer.getId());
            log.info("Returning {} notifications for customerId={}", notifications.size(), customer.getId());
            return ResponseEntity.ok(notifications);

        } catch (Exception e) {
            // On errors, return empty list but log could be added
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.emptyList());
        }
    }
}
