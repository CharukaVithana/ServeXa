package com.servexa.auth.dto;

import com.servexa.common.enums.UserRole;
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
    private UserRole role;
    private String accessToken;
    private String refreshToken;
    private Long expiresIn;
}