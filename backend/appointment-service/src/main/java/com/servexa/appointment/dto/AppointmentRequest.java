package com.servexa.appointment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentRequest {
    
    @NotNull(message = "Customer ID is required")
    private Long customerId;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\(\\d{3}\\)\\s\\d{3}-\\d{4}$", message = "Phone number must be in format (XXX) XXX-XXXX")
    private String phoneNumber;
    
    @NotBlank(message = "Vehicle type is required")
    private String vehicleType;
    
    @NotBlank(message = "Service type is required")
    private String serviceType;
    
    @NotNull(message = "Booking date and time is required")
    private LocalDateTime bookingDateTime;
    
    private String additionalNote;
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
    
    @NotNull(message = "Duration is required")
    private Integer duration;
}