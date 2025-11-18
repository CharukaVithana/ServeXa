package com.servexa.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerStatisticsResponse {
    private Integer activeServices;
    private Integer totalVehicles;
    private Integer pastServices;
    private Integer upcomingAppointments;
    private Double totalSpent;
    private Double averageRating;
    private Integer totalServices;
}