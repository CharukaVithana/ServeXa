package com.servexa.booking.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.servexa.booking.dto.BookingCreateRequest;
import com.servexa.booking.dto.BookingResponse;
import com.servexa.booking.service.BookingService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
public class BookingController {

    private final BookingService bookingService;
    
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

  

    // POST: create booking (status=CREATED, isAssigned=false unless an employee id is provided)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody BookingCreateRequest request) {
        return bookingService.create(request);
    }

    // GET: used by your BookingSuccess page -> getBooking(id)
    @GetMapping("/{id}")
    public BookingResponse getById(@PathVariable String id) {
        return bookingService.getById(id);
    }

    // Optional: dashboard/history
    @GetMapping
    public List<BookingResponse> getAll() {
        return bookingService.getAll();
    }
}
