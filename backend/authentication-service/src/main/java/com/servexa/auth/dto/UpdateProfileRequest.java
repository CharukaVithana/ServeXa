package com.servexa.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;
    
    @Pattern(regexp = "^$|^\\+?[0-9]{1,15}$", message = "Phone number must contain only digits (optionally starting with +)")
    private String phoneNumber;
    
    @Size(max = 500, message = "Address is too long (maximum 500 characters)")
    private String address;
}