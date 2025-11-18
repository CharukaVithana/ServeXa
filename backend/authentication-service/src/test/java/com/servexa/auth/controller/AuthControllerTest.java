package com.servexa.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.servexa.auth.controller.AdminController;
import com.servexa.auth.dto.*;
import com.servexa.auth.entity.User;
import com.servexa.auth.service.AuthService;
import com.servexa.auth.service.AdminService;
import com.servexa.auth.util.TestDataBuilder;
import com.servexa.common.dto.ApiResponse;
import com.servexa.common.enums.UserRole;
import com.servexa.common.enums.UserStatus;
import com.servexa.common.exception.BadRequestException;
import com.servexa.common.exception.UnauthorizedException;
import com.servexa.common.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.servexa.auth.config.TestSecurityConfig;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("AuthController Unit Tests")
class AuthControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private AuthService authService;

        @MockBean
        private JwtUtil jwtUtil;

        @MockBean
        private AdminService adminService; // Mock AdminService to avoid dependency issues

        private SignupRequest signupRequest;
        private LoginRequest loginRequest;
        private User testUser;
        private AuthResponse authResponse;
        private String mockToken;
        private String mockRefreshToken;

        @BeforeEach
        void setUp() {
                signupRequest = TestDataBuilder.createSignupRequest();
                loginRequest = TestDataBuilder.createLoginRequest();
                testUser = TestDataBuilder.createUser();
                mockToken = "mock.jwt.token";
                mockRefreshToken = UUID.randomUUID().toString();
                authResponse = TestDataBuilder.createAuthResponse(mockToken, mockRefreshToken, testUser);
        }

        @Test
        @DisplayName("POST /api/auth/signup - Should successfully register a customer")
        void signup_WithValidRequest_ShouldReturnAuthResponse() throws Exception {
                // Given
                when(authService.signup(any(SignupRequest.class))).thenReturn(authResponse);

                // When & Then
                mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signupRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.message").value("User registered successfully"))
                                .andExpect(jsonPath("$.data.email").value(testUser.getEmail()))
                                .andExpect(jsonPath("$.data.accessToken").value(mockToken));

                verify(authService).signup(any(SignupRequest.class));
        }

        @Test
        @DisplayName("POST /api/auth/signup - Should handle signup failure")
        void signup_WithDuplicateEmail_ShouldReturnBadRequest() throws Exception {
                // Given
                when(authService.signup(any(SignupRequest.class)))
                                .thenThrow(new BadRequestException("Email already registered"));

                // When & Then
                mockMvc.perform(post("/api/auth/signup")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signupRequest)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("POST /api/auth/login - Should successfully login")
        void login_WithValidCredentials_ShouldReturnAuthResponse() throws Exception {
                // Given
                when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

                // When & Then
                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.message").value("Login successful"))
                                .andExpect(jsonPath("$.data.email").value(testUser.getEmail()))
                                .andExpect(jsonPath("$.data.accessToken").value(mockToken));

                verify(authService).login(any(LoginRequest.class));
        }

        @Test
        @DisplayName("POST /api/auth/login - Should handle invalid credentials")
        void login_WithInvalidCredentials_ShouldThrowUnauthorizedException() throws Exception {
                // Given
                when(authService.login(any(LoginRequest.class)))
                                .thenThrow(new UnauthorizedException("Invalid email or password"));

                // When & Then
                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value("Invalid email or password"));
        }

        @Test
        @DisplayName("POST /api/auth/logout - Should successfully logout")
        void logout_WithUserId_ShouldReturnSuccess() throws Exception {
                // Given
                String userId = testUser.getId();

                // When & Then
                mockMvc.perform(post("/api/auth/logout")
                                .param("userId", userId))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.message").value("Logout successful"));

                verify(authService).logout(userId);
        }

        @Test
        @DisplayName("POST /api/auth/logout - Should handle logout without userId")
        void logout_WithoutUserId_ShouldReturnSuccess() throws Exception {
                // When & Then
                mockMvc.perform(post("/api/auth/logout"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.message").value("Logout successful"));

                verify(authService, never()).logout(anyString());
        }

        @Test
        @DisplayName("GET /api/auth/logout - Should successfully logout via GET")
        void logoutGet_WithUserId_ShouldReturnSuccess() throws Exception {
                // Given
                String userId = testUser.getId();

                // When & Then
                mockMvc.perform(get("/api/auth/logout")
                                .param("userId", userId))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.message").value("Logout successful"));

                verify(authService).logout(userId);
        }

        @Test
        @DisplayName("POST /api/auth/refresh - Should successfully refresh token")
        void refreshToken_WithValidRefreshToken_ShouldReturnNewTokens() throws Exception {
                // Given
                RefreshTokenRequest refreshRequest = TestDataBuilder.createRefreshTokenRequest(mockRefreshToken);
                when(authService.refreshToken(mockRefreshToken)).thenReturn(authResponse);

                // When & Then
                mockMvc.perform(post("/api/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(refreshRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.message").value("Token refreshed successfully"))
                                .andExpect(jsonPath("$.data.accessToken").value(mockToken));

                verify(authService).refreshToken(mockRefreshToken);
        }

        @Test
        @DisplayName("GET /api/auth/validate - Should validate token")
        void validateToken_ShouldReturnTrue() throws Exception {
                // When & Then
                mockMvc.perform(get("/api/auth/validate")
                                .param("token", mockToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data").value(true))
                                .andExpect(jsonPath("$.message").value("Token is valid"));
        }

        @Test
        @DisplayName("GET /api/auth/me - Should get current user")
        void getCurrentUser_WithValidToken_ShouldReturnUserData() throws Exception {
                // Given
                String bearerToken = "Bearer " + mockToken;
                when(authService.getCurrentAuthenticatedUser(bearerToken)).thenReturn(authResponse);

                // When & Then
                mockMvc.perform(get("/api/auth/me")
                                .header("Authorization", bearerToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.message").value("User retrieved successfully"))
                                .andExpect(jsonPath("$.data.email").value(testUser.getEmail()));

                verify(authService).getCurrentAuthenticatedUser(bearerToken);
        }

        @Test
        @DisplayName("GET /api/auth/me - Should return null when no user authenticated")
        void getCurrentUser_WithNoToken_ShouldReturnNull() throws Exception {
                // Given
                when(authService.getCurrentAuthenticatedUser(null)).thenReturn(null);

                // When & Then
                mockMvc.perform(get("/api/auth/me"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.message").value("No user authenticated"))
                                .andExpect(jsonPath("$.data").isEmpty());
        }

        @Test
        @DisplayName("GET /api/auth/me - Should handle unauthorized exception")
        void getCurrentUser_WithInvalidToken_ShouldReturnUnauthorized() throws Exception {
                // Given
                String bearerToken = "Bearer invalid.token";
                when(authService.getCurrentAuthenticatedUser(bearerToken))
                                .thenThrow(new UnauthorizedException("Invalid token"));

                // When & Then
                mockMvc.perform(get("/api/auth/me")
                                .header("Authorization", bearerToken))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value("Invalid token"));
        }

        @Test
        @DisplayName("PUT /api/auth/profile - Should update user profile")
        void updateProfile_WithValidRequest_ShouldReturnUpdatedProfile() throws Exception {
                // Given
                String bearerToken = "Bearer " + mockToken;
                UpdateProfileRequest updateRequest = TestDataBuilder.createUpdateProfileRequest();
                when(jwtUtil.validateToken(mockToken)).thenReturn(true);
                when(jwtUtil.getUserIdFromToken(mockToken)).thenReturn(testUser.getId());
                when(authService.updateProfile(eq(testUser.getId()), any(UpdateProfileRequest.class)))
                                .thenReturn(authResponse);

                // When & Then
                mockMvc.perform(put("/api/auth/profile")
                                .header("Authorization", bearerToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.message").value("Profile updated successfully"))
                                .andExpect(jsonPath("$.data.email").value(testUser.getEmail()));

                verify(authService).updateProfile(eq(testUser.getId()), any(UpdateProfileRequest.class));
        }

        @Test
        @DisplayName("PUT /api/auth/profile - Should handle invalid token")
        void updateProfile_WithInvalidToken_ShouldReturnUnauthorized() throws Exception {
                // Given
                String bearerToken = "Bearer invalid.token";
                UpdateProfileRequest updateRequest = TestDataBuilder.createUpdateProfileRequest();
                when(jwtUtil.validateToken("invalid.token")).thenReturn(false);

                // When & Then
                mockMvc.perform(put("/api/auth/profile")
                                .header("Authorization", bearerToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value("Invalid or expired token"));
        }

        @Test
        @DisplayName("PUT /api/auth/users/{userId}/profile-picture - Should update profile picture")
        void updateProfilePicture_WithValidRequest_ShouldReturnUpdatedProfile() throws Exception {
                // Given
                String userId = testUser.getId();
                String bearerToken = "Bearer " + mockToken;
                UpdateProfilePictureRequest pictureRequest = TestDataBuilder.createUpdateProfilePictureRequest();

                when(jwtUtil.validateToken(mockToken)).thenReturn(true);
                when(jwtUtil.getUserIdFromToken(mockToken)).thenReturn(userId);
                when(authService.updateProfilePicture(eq(userId), eq(pictureRequest.getImageUrl())))
                                .thenReturn(authResponse);

                // When & Then
                mockMvc.perform(put("/api/auth/users/{userId}/profile-picture", userId)
                                .header("Authorization", bearerToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(pictureRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.message").value("Profile picture updated successfully"))
                                .andExpect(jsonPath("$.data.email").value(testUser.getEmail()));

                verify(authService).updateProfilePicture(eq(userId), eq(pictureRequest.getImageUrl()));
        }

        @Test
        @DisplayName("PUT /api/auth/users/{userId}/profile-picture - Should prevent updating other user's picture")
        void updateProfilePicture_ForDifferentUser_ShouldReturnUnauthorized() throws Exception {
                // Given
                String userId = UUID.randomUUID().toString();
                String tokenUserId = testUser.getId();
                String bearerToken = "Bearer " + mockToken;
                UpdateProfilePictureRequest pictureRequest = TestDataBuilder.createUpdateProfilePictureRequest();

                when(jwtUtil.validateToken(mockToken)).thenReturn(true);
                when(jwtUtil.getUserIdFromToken(mockToken)).thenReturn(tokenUserId);

                // When & Then
                mockMvc.perform(put("/api/auth/users/{userId}/profile-picture", userId)
                                .header("Authorization", bearerToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(pictureRequest)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value("Cannot update another user's profile picture"));

                verify(authService, never()).updateProfilePicture(anyString(), anyString());
        }
}