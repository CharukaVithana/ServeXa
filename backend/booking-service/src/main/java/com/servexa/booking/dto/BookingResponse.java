package com.servexa.booking.dto;

/**
 * Response returned to the frontend (GET /api/bookings/{id})
 * Fields match the BookingSuccess page expectations.
 */
public record BookingResponse(
        String id,
        String fullName,
        String phone,
        String vehicleType,
        String serviceType,
        String bookingDate,
        String bookingTime,
        String notes,
        String paymentMethod,
        String status,
        boolean isAssigned,
        String assignedEmployeeId,
        Integer duration,
        String customerId
) {}
