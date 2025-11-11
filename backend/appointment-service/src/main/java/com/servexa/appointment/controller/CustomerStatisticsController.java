package com.servexa.appointment.controller;

import com.servexa.appointment.dto.CustomerStatisticsResponse;
import com.servexa.appointment.service.CustomerStatisticsService;
import com.servexa.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments/statistics")
@RequiredArgsConstructor
@CrossOrigin
public class CustomerStatisticsController {

    private final CustomerStatisticsService statisticsService;

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<CustomerStatisticsResponse>> getCustomerStatistics(@PathVariable String customerId) {
        CustomerStatisticsResponse statistics = statisticsService.getCustomerStatistics(customerId);
        return ResponseEntity.ok(ApiResponse.success(statistics, "Customer statistics fetched successfully"));
    }
}