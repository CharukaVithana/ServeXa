package com.servexa.customerservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {
    
    @NotBlank(message = "Model is required")
    private String model;
    
    @NotBlank(message = "Registration number is required")
    private String registrationNumber;
    
    private String imageUrl;
    
    private String year;
    
    private String color;
    
    @NotNull(message = "Customer ID is required")
    private Long customerId;
}

