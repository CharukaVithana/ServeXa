package com.servexa.booking.service;

import com.servexa.booking.dto.BookingCreateRequest;
import com.servexa.booking.dto.BookingResponse;

import java.util.List;

public interface BookingService {
    BookingResponse create(BookingCreateRequest request);
    BookingResponse getById(String id);
    List<BookingResponse> getAll();
}
