package com.servexa.appointment.controller;

import com.servexa.appointment.dto.AppointmentRequest;
import com.servexa.appointment.dto.AppointmentResponse;
import com.servexa.appointment.service.AppointmentService;
import com.servexa.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AppointmentController {
    
    private final AppointmentService appointmentService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        log.info("Creating new appointment for customer: {}", request.getCustomerId());
        AppointmentResponse response = appointmentService.createAppointment(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<AppointmentResponse>builder()
                        .success(true)
                        .message("Appointment created successfully")
                        .data(response)
                        .build());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable String id) {
        AppointmentResponse response = appointmentService.getAppointmentById(id);
        
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .data(response)
                .build());
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getCustomerAppointments(
            @PathVariable Long customerId) {
        List<AppointmentResponse> appointments = appointmentService.getAppointmentsByCustomerId(customerId);
        
        return ResponseEntity.ok(ApiResponse.<List<AppointmentResponse>>builder()
                .success(true)
                .data(appointments)
                .build());
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getEmployeeAppointments(
            @PathVariable Long employeeId) {
        List<AppointmentResponse> appointments = appointmentService.getAppointmentsByEmployeeId(employeeId);
        
        return ResponseEntity.ok(ApiResponse.<List<AppointmentResponse>>builder()
                .success(true)
                .data(appointments)
                .build());
    }
    
    @GetMapping("/unassigned")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getUnassignedAppointments() {
        List<AppointmentResponse> appointments = appointmentService.getUnassignedAppointments();
        
        return ResponseEntity.ok(ApiResponse.<List<AppointmentResponse>>builder()
                .success(true)
                .data(appointments)
                .build());
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointmentStatus(
            @PathVariable String id,
            @RequestParam String status) {
        AppointmentResponse response = appointmentService.updateAppointmentStatus(id, status);
        
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Appointment status updated successfully")
                .data(response)
                .build());
    }
    
    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<AppointmentResponse>> assignEmployee(
            @PathVariable String id,
            @RequestParam Long employeeId) {
        AppointmentResponse response = appointmentService.assignEmployee(id, employeeId);
        
        return ResponseEntity.ok(ApiResponse.<AppointmentResponse>builder()
                .success(true)
                .message("Employee assigned successfully")
                .data(response)
                .build());
    }
}