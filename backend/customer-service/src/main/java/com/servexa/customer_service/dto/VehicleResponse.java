package com.servexa.customerservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    
    private Long id;
    private String model;
    private String registrationNumber;
    private String imageUrl;
    private String year;
    private String color;
    private Long customerId;
}

