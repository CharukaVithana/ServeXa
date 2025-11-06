package com.servexa.auth.dto;

import com.servexa.common.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusUpdateRequest {
    
    @NotNull(message = "Status is required")
    private UserStatus status;
}