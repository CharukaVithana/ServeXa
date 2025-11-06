package com.servexa.booking.dto;

import com.servexa.booking.entity.ServiceType;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * Request payload for creating a booking (POST /api/bookings)
 * Uses Java record -> access with req.fullName(), req.bookingDate(), ...
 */
public record BookingCreateRequest(
        @NotBlank String fullName,
        @NotBlank @Pattern(regexp = "^[0-9+\\-() ]{7,20}$") String phone,
        @NotBlank String vehicleType,
        @NotNull ServiceType serviceType,
        @NotNull LocalDate bookingDate,
        @NotNull LocalTime bookingTime,
        String notes,
        @NotBlank String paymentMethod,
        UUID assignedEmployeeId,            // nullable
        @NotNull @Positive Integer duration,
        @NotNull UUID customerId
) {}
