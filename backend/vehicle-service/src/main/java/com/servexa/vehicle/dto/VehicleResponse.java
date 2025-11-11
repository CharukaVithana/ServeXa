package com.servexa.vehicle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    
    private Long id;
    private String customerId;
    private String registrationNumber;
    private String make;
    private String model;
    private Integer year;
    private String color;
    private String vin;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}