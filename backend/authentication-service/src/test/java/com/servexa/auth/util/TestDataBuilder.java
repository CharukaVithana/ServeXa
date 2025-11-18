package com.servexa.auth.util;

import com.servexa.auth.dto.*;
import com.servexa.auth.entity.User;
import com.servexa.common.enums.UserRole;
import com.servexa.common.enums.UserStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class TestDataBuilder {

    public static User createUser() {
        return createUser("test@example.com", UserRole.CUSTOMER, UserStatus.APPROVED);
    }

    public static User createUser(String email, UserRole role, UserStatus status) {
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setPassword("$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW"); // Password@123
        user.setFullName("Test User");
        user.setPhoneNumber("+1234567890");
        user.setAddress("123 Test Street");
        user.setRole(role);
        user.setStatus(status);
        user.setActive(true);
        user.setEmailVerified(false);
        return user;
    }

    public static SignupRequest createSignupRequest() {
        return createSignupRequest("test@example.com", UserRole.CUSTOMER);
    }

    public static SignupRequest createSignupRequest(String email, UserRole role) {
        SignupRequest request = new SignupRequest();
        request.setFullName("Test User");
        request.setEmail(email);
        request.setPassword("Password@123"); // Updated to meet validation requirements
        request.setPhoneNumber("+1234567890");
        request.setRole(role);
        return request;
    }

    public static LoginRequest createLoginRequest() {
        return createLoginRequest("test@example.com", "Password@123");
    }

    public static LoginRequest createLoginRequest(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }

    public static UpdateProfileRequest createUpdateProfileRequest() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Updated Name");
        request.setPhoneNumber("+0987654321");
        request.setAddress("456 Updated Street");
        return request;
    }

    public static UpdateProfilePictureRequest createUpdateProfilePictureRequest() {
        UpdateProfilePictureRequest request = new UpdateProfilePictureRequest();
        request.setImageUrl("https://example.com/profile.jpg");
        return request;
    }

    public static RefreshTokenRequest createRefreshTokenRequest(String refreshToken) {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken(refreshToken);
        return request;
    }

    public static UserStatusUpdateRequest createUserStatusUpdateRequest(UserStatus status) {
        UserStatusUpdateRequest request = new UserStatusUpdateRequest();
        request.setStatus(status);
        return request;
    }

    public static AuthResponse createAuthResponse(String token, String refreshToken, User user) {
        AuthResponse response = new AuthResponse();
        response.setAccessToken(token);
        response.setRefreshToken(refreshToken);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setFullName(user.getFullName());
        response.setStatus(user.getStatus());
        response.setExpiresIn(3600000L);
        return response;
    }
}