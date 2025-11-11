package com.servexa.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {

    private String id;
    private String customerId;
    private String fullName;
    private String phoneNumber;
    private String vehicleId;
    private String vehicleType;
    private String serviceType;
    private LocalDateTime bookingDateTime;
    private String additionalNote;
    private String paymentMethod;
    private String status;
    private Boolean isAssigned;
    private String assignedEmployeeId;
    private Integer duration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}