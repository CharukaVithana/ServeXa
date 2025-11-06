package com.servexa.booking.service.impl;

import com.servexa.booking.dto.BookingCreateRequest;
import com.servexa.booking.dto.BookingResponse;
import com.servexa.booking.entity.Booking;
import com.servexa.booking.repository.BookingRepository;
import com.servexa.booking.service.BookingService;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ISO_LOCAL_TIME;

    @Override
    public BookingResponse create(BookingCreateRequest req) {
        Booking booking = new Booking();
        booking.setFullName(req.fullName());
        booking.setPhone(req.phone());
        booking.setVehicleType(req.vehicleType());
        booking.setServiceType(req.serviceType());
        booking.setBookingDate(req.bookingDate());
        booking.setBookingTime(req.bookingTime());
        booking.setNotes(req.notes());
        booking.setPaymentMethod(req.paymentMethod());
        booking.setAssignedEmployeeId(req.assignedEmployeeId());
        booking.setDuration(req.duration());
        booking.setCustomerId(req.customerId());

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    @Override
    public BookingResponse getById(String id) {
        UUID uuid = UUID.fromString(id);
        return bookingRepository.findById(uuid)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
    }

    @Override
    public List<BookingResponse> getAll() {
        return bookingRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    private BookingResponse toResponse(Booking b) {
        return new BookingResponse(
                b.getId() != null ? b.getId().toString() : null,
                b.getFullName(),
                b.getPhone(),
                b.getVehicleType(),
                b.getServiceType() != null ? b.getServiceType().name() : null,
                b.getBookingDate() != null ? b.getBookingDate().format(DATE_FMT) : null,
                b.getBookingTime() != null ? b.getBookingTime().format(TIME_FMT) : null,
                b.getNotes(),
                b.getPaymentMethod(),
                b.getStatus() != null ? b.getStatus().name() : null,
                b.isAssigned(),
                b.getAssignedEmployeeId() != null ? b.getAssignedEmployeeId().toString() : null,
                b.getDuration(),
                b.getCustomerId() != null ? b.getCustomerId().toString() : null
        );
    }
}