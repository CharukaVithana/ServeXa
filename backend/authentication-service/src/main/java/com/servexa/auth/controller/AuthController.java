package com.servexa.auth.controller;

import com.servexa.auth.dto.AuthResponse;
import com.servexa.auth.dto.LoginRequest;
import com.servexa.auth.dto.RefreshTokenRequest;
import com.servexa.auth.dto.SignupRequest;
import com.servexa.auth.dto.UpdateProfileRequest;
import com.servexa.auth.dto.UpdateProfilePictureRequest;
import com.servexa.auth.service.AuthService;
import com.servexa.common.dto.ApiResponse;
import com.servexa.common.exception.UnauthorizedException;
import com.servexa.common.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        try {
            // Register user in Auth Service
            AuthResponse signupResponse = authService.signup(request);

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
        log.info("GET /me called with Authorization header: {}",
                token != null ? token.substring(0, Math.min(token.length(), 30)) + "..." : "null");

        try {
            AuthResponse user = authService.getCurrentAuthenticatedUser(token);

            if (user == null) {
                log.info("getCurrentAuthenticatedUser returned null");
                return ResponseEntity.ok(
                        ApiResponse.success(null, "No user authenticated"));
            }

            log.info("User retrieved successfully: {}", user.getEmail());
            return ResponseEntity.ok(
                    ApiResponse.success(user, "User retrieved successfully"));
        } catch (UnauthorizedException e) {
            log.error("Unauthorized exception in /me endpoint: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.<AuthResponse>error(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error in /me endpoint", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.<AuthResponse>error("Failed to retrieve user information"));
        }
    }

    @RequestMapping(value = "/profile", method = RequestMethod.PUT)
    @Operation(summary = "Update user profile")
    public ResponseEntity<ApiResponse<AuthResponse>> updateProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody UpdateProfileRequest request) {
        log.info("PUT /profile called");

        try {
            // Extract user ID from token
            if (token == null || !token.startsWith("Bearer ")) {
                throw new UnauthorizedException("Invalid authorization header");
            }

            String jwtToken = token.substring(7);
            String userId = jwtUtil.getUserIdFromToken(jwtToken);

            // Validate token
            if (!jwtUtil.validateToken(jwtToken)) {
                throw new UnauthorizedException("Invalid or expired token");
            }

            // Update profile
            AuthResponse updatedProfile = authService.updateProfile(userId, request);

            return ResponseEntity.ok(
                    ApiResponse.success(updatedProfile, "Profile updated successfully"));

        } catch (UnauthorizedException e) {
            log.error("Unauthorized exception in /profile endpoint: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.<AuthResponse>error(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error in /profile endpoint", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.<AuthResponse>error("Failed to update profile"));
        }
    }

    @PutMapping("/users/{userId}/profile-picture")
    @Operation(summary = "Update user profile picture")
    public ResponseEntity<ApiResponse<AuthResponse>> updateProfilePicture(
            @PathVariable String userId,
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody UpdateProfilePictureRequest request) {
        log.info("PUT /users/{}/profile-picture called", userId);

        try {
            if (token == null || !token.startsWith("Bearer ")) {
                throw new UnauthorizedException("Invalid authorization header");
            }

            String jwtToken = token.substring(7);

            if (!jwtUtil.validateToken(jwtToken)) {
                throw new UnauthorizedException("Invalid or expired token");
            }

            String tokenUserId = jwtUtil.getUserIdFromToken(jwtToken);
            if (!tokenUserId.equals(userId)) {
                throw new UnauthorizedException("Cannot update another user's profile picture");
            }

            AuthResponse updatedProfile = authService.updateProfilePicture(userId, request.getImageUrl());

            return ResponseEntity.ok(
                    ApiResponse.success(updatedProfile, "Profile picture updated successfully"));

        } catch (UnauthorizedException e) {
            log.error("Unauthorized exception in /users/{}/profile-picture endpoint: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ApiResponse.<AuthResponse>error(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error in /users/{}/profile-picture endpoint", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.<AuthResponse>error("Failed to update profile picture"));
        }
    }
}
