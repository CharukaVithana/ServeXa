package com.servexa.auth.dto;

import com.servexa.common.enums.UserRole;
import com.servexa.common.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String userId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String address;
    private String imageUrl;
    private UserRole role;
    private UserStatus status;
    private boolean isEmailVerified;
    private String accessToken;
    private String refreshToken;
    private Long expiresIn;
}