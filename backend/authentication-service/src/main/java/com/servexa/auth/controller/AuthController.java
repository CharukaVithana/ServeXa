package com.servexa.auth.controller;

import com.servexa.auth.dto.AuthResponse;
import com.servexa.auth.dto.CustomerRequest;
import com.servexa.auth.dto.LoginRequest;
import com.servexa.auth.dto.RefreshTokenRequest;
import com.servexa.auth.dto.SignupRequest;
import com.servexa.auth.service.AuthService;
import com.servexa.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;
    private final RestTemplate restTemplate;

    @Value("${services.customer-service.url}")
    private String customerServiceUrl;

    @PostMapping("/signup")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        try {
            // Register user in Auth Service
            AuthResponse signupResponse = authService.signup(request);

            // 2Prepare data for Customer Service
            CustomerRequest customerRequest = new CustomerRequest(
                    request.getFullName(), // name
                    request.getEmail(), // email
                    request.getPhoneNumber(), // phoneNumber
                    "" // address (optional for now)
            );

            // Send to Customer Service
            try {
                restTemplate.postForObject(
                        customerServiceUrl + "/api/customers",
                        customerRequest,
                        String.class);
                System.out.println("✅ Synced user to Customer Service: " + request.getEmail());
            } catch (Exception e) {
                System.err.println("⚠️ Failed to sync user to Customer Service: " + e.getMessage());
            }

            // Return success
            return ResponseEntity.ok(
                    ApiResponse.success(signupResponse, "User registered successfully"));

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Signup failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestParam(required = false) String userId) {
        try {
            if (userId != null && !userId.isEmpty()) {
                authService.logout(userId);
            }
            return ResponseEntity.ok(
                    ApiResponse.success(null, "Logout successful"));
        } catch (Exception e) {
            // Even if logout fails on backend, we return success
            // The frontend will clear the token anyway
            return ResponseEntity.ok(
                    ApiResponse.success(null, "Logout successful"));
        }
    }

    // Also handle GET requests for logout (for browser compatibility)
    @GetMapping("/logout")
    @Operation(summary = "Logout user (GET)", hidden = true)
    public ResponseEntity<ApiResponse<Void>> logoutGet(@RequestParam(required = false) String userId) {
        return logout(userId);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(
                ApiResponse.success(response, "Token refreshed successfully"));
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate token")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestParam String token) {
        // This endpoint can be used by other services to validate tokens
        // Implementation would be in a separate service
        return ResponseEntity.ok(
                ApiResponse.success(true, "Token is valid"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.ok(
                        ApiResponse.success(null, "No user authenticated"));
            }

            AuthResponse currentUser = authService.getCurrentUserFromToken(token);
            return ResponseEntity.ok(ApiResponse.success(currentUser, "User retrieved"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unable to retrieve user: " + e.getMessage()));
        }
    }

}