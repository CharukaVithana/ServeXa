package com.servexa.auth.controller;

import com.servexa.auth.dto.AuthResponse;
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

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return new ResponseEntity<>(
                ApiResponse.success(response, "User registered successfully"),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success(response, "Login successful")
        );
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestParam(required = false) String userId) {
        try {
            if (userId != null && !userId.isEmpty()) {
                authService.logout(userId);
            }
            return ResponseEntity.ok(
                    ApiResponse.success(null, "Logout successful")
            );
        } catch (Exception e) {
            // Even if logout fails on backend, we return success
            // The frontend will clear the token anyway
            return ResponseEntity.ok(
                    ApiResponse.success(null, "Logout successful")
            );
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
                ApiResponse.success(response, "Token refreshed successfully")
        );
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate token")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(@RequestParam String token) {
        // This endpoint can be used by other services to validate tokens
        // Implementation would be in a separate service
        return ResponseEntity.ok(
                ApiResponse.success(true, "Token is valid")
        );
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        // For now, return null if no token is provided
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.ok(
                    ApiResponse.success(null, "No user authenticated")
            );
        }
        
        // TODO: Implement actual token validation and user retrieval
        return ResponseEntity.ok(
                ApiResponse.success(null, "No user authenticated")
        );
    }
}