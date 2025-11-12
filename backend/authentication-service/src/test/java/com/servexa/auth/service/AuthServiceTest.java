package com.servexa.auth.service;

import com.servexa.auth.dto.*;
import com.servexa.auth.entity.User;
import com.servexa.auth.repository.UserRepository;
import com.servexa.auth.util.TestDataBuilder;
import com.servexa.common.enums.UserRole;
import com.servexa.common.enums.UserStatus;
import com.servexa.common.exception.BadRequestException;
import com.servexa.common.exception.UnauthorizedException;
import com.servexa.common.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private User testUser;
    private String mockToken;
    private String mockRefreshToken;

    @BeforeEach
    void setUp() {
        signupRequest = TestDataBuilder.createSignupRequest();
        loginRequest = TestDataBuilder.createLoginRequest();
        testUser = TestDataBuilder.createUser();
        mockToken = "mock.jwt.token";
        mockRefreshToken = UUID.randomUUID().toString();
    }

    @Test
    @DisplayName("Should successfully signup a customer user")
    void signup_WithCustomerRole_ShouldReturnAuthResponse() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID().toString());
            return user;
        });
        when(jwtUtil.generateToken(anyString(), any(), any())).thenReturn(mockToken);

        // When
        AuthResponse response = authService.signup(signupRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo(signupRequest.getEmail());
        assertThat(response.getRole()).isEqualTo(UserRole.CUSTOMER);
        assertThat(response.getStatus()).isEqualTo(UserStatus.APPROVED);
        assertThat(response.getAccessToken()).isEqualTo(mockToken);
        assertThat(response.getRefreshToken()).isNotNull();

        verify(userRepository, times(2)).save(any(User.class));
        verify(jwtUtil).generateToken(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should signup admin/employee with pending status")
    void signup_WithAdminRole_ShouldReturnPendingStatus() {
        // Given
        signupRequest.setRole(UserRole.ADMIN);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(UUID.randomUUID().toString());
            return user;
        });

        // When
        AuthResponse response = authService.signup(signupRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(UserStatus.PENDING);
        assertThat(response.getAccessToken()).isNull();
        assertThat(response.getRefreshToken()).isNull();

        verify(userRepository, times(1)).save(any(User.class));
        verify(jwtUtil, never()).generateToken(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void signup_WithExistingEmail_ShouldThrowBadRequestException() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.signup(signupRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Email already registered");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void login_WithValidCredentials_ShouldReturnAuthResponse() {
        // Given
        testUser.setStatus(UserStatus.APPROVED);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), any(), any())).thenReturn(mockToken);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(response.getAccessToken()).isEqualTo(mockToken);
        assertThat(response.getRefreshToken()).isNotNull();

        verify(userRepository).save(argThat(user -> user.getRefreshToken() != null));
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void login_WithInvalidEmail_ShouldThrowUnauthorizedException() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");

        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw exception when password is incorrect")
    void login_WithIncorrectPassword_ShouldThrowUnauthorizedException() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");

        verify(jwtUtil, never()).generateToken(anyString(), any(), any());
    }

    @Test
    @DisplayName("Should throw exception when account is deactivated")
    void login_WithDeactivatedAccount_ShouldThrowUnauthorizedException() {
        // Given
        testUser.setActive(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Account is deactivated");
    }

    @Test
    @DisplayName("Should throw exception when account is pending")
    void login_WithPendingStatus_ShouldThrowUnauthorizedException() {
        // Given
        testUser.setStatus(UserStatus.PENDING);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Your account is pending approval from an administrator");
    }

    @Test
    @DisplayName("Should successfully logout user")
    void logout_WithValidUserId_ShouldClearRefreshToken() {
        // Given
        String userId = testUser.getId();
        testUser.setRefreshToken(mockRefreshToken);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        authService.logout(userId);

        // Then
        verify(userRepository).save(argThat(user -> user.getRefreshToken() == null));
    }

    @Test
    @DisplayName("Should handle logout with empty userId")
    void logout_WithEmptyUserId_ShouldReturnEarly() {
        // When
        authService.logout("");

        // Then
        verify(userRepository, never()).findById(anyString());
    }

    @Test
    @DisplayName("Should successfully refresh token")
    void refreshToken_WithValidRefreshToken_ShouldReturnNewTokens() {
        // Given
        testUser.setRefreshToken(mockRefreshToken);
        when(userRepository.findByRefreshToken(mockRefreshToken)).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken(anyString(), any(), any())).thenReturn("new.jwt.token");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        AuthResponse response = authService.refreshToken(mockRefreshToken);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("new.jwt.token");
        assertThat(response.getRefreshToken()).isNotNull();
        assertThat(response.getRefreshToken()).isNotEqualTo(mockRefreshToken);

        verify(userRepository).save(argThat(user -> 
            user.getRefreshToken() != null && !user.getRefreshToken().equals(mockRefreshToken)
        ));
    }

    @Test
    @DisplayName("Should throw exception when refresh token is invalid")
    void refreshToken_WithInvalidToken_ShouldThrowUnauthorizedException() {
        // Given
        when(userRepository.findByRefreshToken(anyString())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authService.refreshToken("invalid-token"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid refresh token");
    }

    @Test
    @DisplayName("Should get current authenticated user from token")
    void getCurrentAuthenticatedUser_WithValidToken_ShouldReturnUserData() {
        // Given
        String bearerToken = "Bearer " + mockToken;
        when(jwtUtil.validateToken(mockToken)).thenReturn(true);
        when(jwtUtil.getUserIdFromToken(mockToken)).thenReturn(testUser.getId());
        when(jwtUtil.getExpirationFromToken(mockToken)).thenReturn(System.currentTimeMillis() + 3600000L);
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

        // When
        AuthResponse response = authService.getCurrentAuthenticatedUser(bearerToken);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(testUser.getId());
        assertThat(response.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(response.getAccessToken()).isEqualTo(mockToken);
    }

    @Test
    @DisplayName("Should return null when authorization header is invalid")
    void getCurrentAuthenticatedUser_WithInvalidHeader_ShouldReturnNull() {
        // When
        AuthResponse response = authService.getCurrentAuthenticatedUser("InvalidHeader");

        // Then
        assertThat(response).isNull();
        verify(jwtUtil, never()).validateToken(anyString());
    }

    @Test
    @DisplayName("Should throw exception when user is not approved")
    void getCurrentAuthenticatedUser_WithNonApprovedUser_ShouldThrowUnauthorizedException() {
        // Given
        String bearerToken = "Bearer " + mockToken;
        testUser.setStatus(UserStatus.PENDING);
        when(jwtUtil.validateToken(mockToken)).thenReturn(true);
        when(jwtUtil.getUserIdFromToken(mockToken)).thenReturn(testUser.getId());
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

        // When & Then
        assertThatThrownBy(() -> authService.getCurrentAuthenticatedUser(bearerToken))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Account is not approved");
    }

    @Test
    @DisplayName("Should successfully update user profile")
    void updateProfile_WithValidData_ShouldReturnUpdatedUser() {
        // Given
        UpdateProfileRequest updateRequest = TestDataBuilder.createUpdateProfileRequest();
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        AuthResponse response = authService.updateProfile(testUser.getId().toString(), updateRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getFullName()).isEqualTo(updateRequest.getFullName());
        assertThat(response.getPhoneNumber()).isEqualTo(updateRequest.getPhoneNumber());
        assertThat(response.getAddress()).isEqualTo(updateRequest.getAddress());

        verify(userRepository).save(argThat(user -> 
            user.getFullName().equals(updateRequest.getFullName()) &&
            user.getPhoneNumber().equals(updateRequest.getPhoneNumber()) &&
            user.getAddress().equals(updateRequest.getAddress())
        ));
    }

    @Test
    @DisplayName("Should successfully update profile picture")
    void updateProfilePicture_WithValidData_ShouldReturnUpdatedUser() {
        // Given
        String newImageUrl = "https://example.com/new-profile.jpg";
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        AuthResponse response = authService.updateProfilePicture(testUser.getId().toString(), newImageUrl);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getImageUrl()).isEqualTo(newImageUrl);

        verify(userRepository).save(argThat(user -> user.getImageUrl().equals(newImageUrl)));
    }

    @Test
    @DisplayName("Should get current user from bearer token")
    void getCurrentUserFromToken_WithValidToken_ShouldReturnUserData() {
        // Given
        String bearerToken = "Bearer " + mockToken;
        Date expirationDate = new Date(System.currentTimeMillis() + 3600000L);
        
        when(jwtUtil.validateToken(mockToken)).thenReturn(true);
        when(jwtUtil.extractUserId(mockToken)).thenReturn(testUser.getId());
        when(jwtUtil.extractExpiration(mockToken)).thenReturn(expirationDate);
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

        // When
        AuthResponse response = authService.getCurrentUserFromToken(bearerToken);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(testUser.getId());
        assertThat(response.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(response.getAccessToken()).isEqualTo(mockToken);
        assertThat(response.getExpiresIn()).isGreaterThan(0L);
    }

    @Test
    @DisplayName("Should throw exception when bearer token is missing")
    void getCurrentUserFromToken_WithoutBearerPrefix_ShouldThrowUnauthorizedException() {
        // When & Then
        assertThatThrownBy(() -> authService.getCurrentUserFromToken("invalid-token"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Missing or invalid Authorization header");
    }

    @Test
    @DisplayName("Should throw exception when token is invalid")
    void getCurrentUserFromToken_WithInvalidToken_ShouldThrowUnauthorizedException() {
        // Given
        String bearerToken = "Bearer " + mockToken;
        when(jwtUtil.validateToken(mockToken)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> authService.getCurrentUserFromToken(bearerToken))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid or expired token");
    }
}