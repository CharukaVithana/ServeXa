package com.servexa.appointment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.servexa.appointment.dto.AppointmentRequest;
import com.servexa.appointment.dto.AppointmentResponse;
import com.servexa.appointment.service.AppointmentService;
import com.servexa.common.dto.ApiResponse;
import com.servexa.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppointmentController.class)
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    private AppointmentRequest appointmentRequest;
    private AppointmentResponse appointmentResponse;

    @BeforeEach
    void setUp() {
        LocalDateTime bookingTime = LocalDateTime.now().plusDays(1);
        
        appointmentRequest = AppointmentRequest.builder()
                .customerId(1L)
                .fullName("John Doe")
                .phoneNumber("(555) 123-4567")
                .vehicleType("Toyota Corolla 2020")
                .serviceType("Oil Change")
                .bookingDateTime(bookingTime)
                .additionalNote("Please check brakes")
                .paymentMethod("Cash at Service Center")
                .duration(60)
                .build();

        appointmentResponse = AppointmentResponse.builder()
                .id("test-uuid-1")
                .customerId(1L)
                .fullName("John Doe")
                .phoneNumber("(555) 123-4567")
                .vehicleType("Toyota Corolla 2020")
                .serviceType("Oil Change")
                .bookingDateTime(bookingTime)
                .additionalNote("Please check brakes")
                .paymentMethod("Cash at Service Center")
                .status("CREATED")
                .isAssigned(false)
                .duration(60)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createAppointment_Success() throws Exception {
        when(appointmentService.createAppointment(any(AppointmentRequest.class)))
                .thenReturn(appointmentResponse);

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Appointment created successfully"))
                .andExpect(jsonPath("$.data.id").value("test-uuid-1"))
                .andExpect(jsonPath("$.data.customerId").value(1L))
                .andExpect(jsonPath("$.data.status").value("CREATED"))
                .andExpect(jsonPath("$.data.isAssigned").value(false));
    }

    @Test
    void createAppointment_ValidationError() throws Exception {
        AppointmentRequest invalidRequest = AppointmentRequest.builder()
                .customerId(null) // Required field
                .fullName("") // Required field
                .phoneNumber("invalid") // Invalid format
                .build();

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAppointmentById_Success() throws Exception {
        when(appointmentService.getAppointmentById("test-uuid-1")).thenReturn(appointmentResponse);

        mockMvc.perform(get("/api/appointments/test-uuid-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("test-uuid-1"))
                .andExpect(jsonPath("$.data.fullName").value("John Doe"));
    }

    @Test
    void getAppointmentById_NotFound() throws Exception {
        when(appointmentService.getAppointmentById("non-existent-id"))
                .thenThrow(new ResourceNotFoundException("Appointment not found with ID: non-existent-id"));

        mockMvc.perform(get("/api/appointments/non-existent-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCustomerAppointments_Success() throws Exception {
        List<AppointmentResponse> appointments = Arrays.asList(appointmentResponse);
        when(appointmentService.getAppointmentsByCustomerId(1L)).thenReturn(appointments);

        mockMvc.perform(get("/api/appointments/customer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].customerId").value(1L));
    }

    @Test
    void getEmployeeAppointments_Success() throws Exception {
        appointmentResponse.setAssignedEmployeeId("10");
        appointmentResponse.setIsAssigned(true);
        List<AppointmentResponse> appointments = Arrays.asList(appointmentResponse);
        when(appointmentService.getAppointmentsByEmployeeId("10")).thenReturn(appointments);

        mockMvc.perform(get("/api/appointments/employee/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].assignedEmployeeId").value("10"));
    }

    @Test
    void getUnassignedAppointments_Success() throws Exception {
        List<AppointmentResponse> appointments = Arrays.asList(appointmentResponse);
        when(appointmentService.getUnassignedAppointments()).thenReturn(appointments);

        mockMvc.perform(get("/api/appointments/unassigned"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].isAssigned").value(false));
    }

    @Test
    void updateAppointmentStatus_Success() throws Exception {
        appointmentResponse.setStatus("IN_PROGRESS");
        when(appointmentService.updateAppointmentStatus("test-uuid-1", "IN_PROGRESS"))
                .thenReturn(appointmentResponse);

        mockMvc.perform(put("/api/appointments/test-uuid-1/status")
                        .param("status", "IN_PROGRESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Appointment status updated successfully"))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));
    }

    @Test
    void assignEmployee_Success() throws Exception {
        appointmentResponse.setAssignedEmployeeId("10");
        appointmentResponse.setIsAssigned(true);
        when(appointmentService.assignEmployee("test-uuid-1", "10")).thenReturn(appointmentResponse);

        mockMvc.perform(put("/api/appointments/test-uuid-1/assign")
                        .param("employeeId", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Employee assigned successfully"))
                .andExpect(jsonPath("$.data.assignedEmployeeId").value("10"))
                .andExpect(jsonPath("$.data.isAssigned").value(true));
    }
}