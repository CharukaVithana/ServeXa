package com.servexa.auth.service;

import com.servexa.auth.dto.AuthResponse;
import com.servexa.auth.dto.LoginRequest;
import com.servexa.auth.dto.SignupRequest;
import com.servexa.auth.entity.User;
import com.servexa.auth.repository.UserRepository;
import com.servexa.common.exception.BadRequestException;
import com.servexa.common.exception.UnauthorizedException;
import com.servexa.common.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        log.info("Signup attempt for email: {}", request.getEmail());

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.error("Email already registered: {}", request.getEmail());
            throw new BadRequestException("Email already registered");
        }

        try {
            // Create new user
            User user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .fullName(request.getFullName())
                    .phoneNumber(request.getPhoneNumber())
                    .role(request.getRole())
                    .isEmailVerified(false)
                    .build();

            // Save user
            user = userRepository.save(user);
            log.info("User created with ID: {}, Email: {}", user.getId(), user.getEmail());

            // Generate tokens
            String accessToken = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
            String refreshToken = UUID.randomUUID().toString();

            // Update refresh token
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            log.info("Signup successful for user: {}", user.getEmail());
            return buildAuthResponse(user, accessToken, refreshToken);
        } catch (Exception e) {
            log.error("Error during signup for email: {}", request.getEmail(), e);
            throw new RuntimeException("Signup failed: " + e.getMessage());
        }
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", request.getEmail());
                    return new UnauthorizedException("Invalid email or password");
                });

        log.info("User found: {}, Active: {}", user.getEmail(), user.isActive());

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.error("Password mismatch for user: {}", user.getEmail());
            throw new UnauthorizedException("Invalid email or password");
        }

        // Check if user is active
        if (!user.isActive()) {
            log.error("User account is deactivated: {}", user.getEmail());
            throw new UnauthorizedException("Account is deactivated");
        }

        try {
            // Generate tokens
            String accessToken = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
            String refreshToken = UUID.randomUUID().toString();

            // Update refresh token
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            log.info("Login successful for user: {}", user.getEmail());
            return buildAuthResponse(user, accessToken, refreshToken);
        } catch (Exception e) {
            log.error("Error during login for user: {}", user.getEmail(), e);
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    @Transactional
    public void logout(String userId) {
        log.info("Logout request for userId: {}", userId);

        if (userId == null || userId.trim().isEmpty()) {
            log.warn("Logout called with empty userId");
            return;
        }

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.error("User not found for logout: {}", userId);
                        return new UnauthorizedException("Invalid user");
                    });

            // Clear refresh token
            user.setRefreshToken(null);
            userRepository.save(user);
            log.info("Successfully logged out user: {}", userId);
        } catch (Exception e) {
            log.error("Error during logout for userId: {}", userId, e);
            throw e;
        }
    }

    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        // Find user by refresh token
        User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        // Generate new tokens
        String newAccessToken = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole());
        String newRefreshToken = UUID.randomUUID().toString();

        // Update refresh token
        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(86400000L) // 24 hours
                .build();
    }

    /**
     * Return the current authenticated user's info based on a Bearer token.
     * The token must be a valid JWT previously issued by this service.
     */
    @Transactional(readOnly = true)
    public AuthResponse getCurrentUserFromToken(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }

        String token = bearerToken.substring(7);

        if (!jwtUtil.validateToken(token)) {
            throw new UnauthorizedException("Invalid or expired token");
        }

        String userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Compute remaining expiration milliseconds
        long expiresIn = 0L;
        try {
            long expMillis = jwtUtil.extractExpiration(token).getTime();
            expiresIn = Math.max(0L, expMillis - System.currentTimeMillis());
        } catch (Exception ignored) {
        }

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .accessToken(token)
                .refreshToken(user.getRefreshToken())
                .expiresIn(expiresIn)
                .build();
    }
}