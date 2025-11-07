package com.servexa.appointment.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.servexa.appointment.dto.AppointmentRequest;
import com.servexa.appointment.entity.Appointment;
import com.servexa.appointment.repository.AppointmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AppointmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private AppointmentRequest appointmentRequest;

    @BeforeEach
    void setUp() {
        appointmentRepository.deleteAll();
        
        appointmentRequest = AppointmentRequest.builder()
                .customerId(1L)
                .fullName("John Doe")
                .phoneNumber("(555) 123-4567")
                .vehicleType("Toyota Corolla 2020")
                .serviceType("Oil Change")
                .bookingDateTime(LocalDateTime.now().plusDays(1))
                .additionalNote("Please check brakes")
                .paymentMethod("Cash at Service Center")
                .duration(60)
                .build();
    }

    @Test
    void createAndRetrieveAppointment_Success() throws Exception {
        // Create appointment
        String response = mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.customerId").value(1L))
                .andExpect(jsonPath("$.data.status").value("CREATED"))
                .andExpect(jsonPath("$.data.isAssigned").value(false))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extract ID from response
        String appointmentId = objectMapper.readTree(response).get("data").get("id").asText();

        // Verify in database
        List<Appointment> appointments = appointmentRepository.findAll();
        assertThat(appointments).hasSize(1);
        assertThat(appointments.get(0).getId()).isEqualTo(appointmentId);

        // Retrieve appointment
        mockMvc.perform(get("/api/appointments/" + appointmentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(appointmentId))
                .andExpect(jsonPath("$.data.fullName").value("John Doe"));
    }

    @Test
    void updateAppointmentStatusAndAssignEmployee_Success() throws Exception {
        // Create appointment
        Appointment savedAppointment = appointmentRepository.save(
                Appointment.builder()
                        .customerId(1L)
                        .fullName("John Doe")
                        .phoneNumber("(555) 123-4567")
                        .vehicleType("Toyota Corolla 2020")
                        .serviceType("Oil Change")
                        .bookingDateTime(LocalDateTime.now().plusDays(1))
                        .paymentMethod("Cash at Service Center")
                        .status("CREATED")
                        .isAssigned(false)
                        .duration(60)
                        .build()
        );

        String appointmentId = savedAppointment.getId();

        // Update status
        mockMvc.perform(put("/api/appointments/" + appointmentId + "/status")
                        .param("status", "IN_PROGRESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));

        // Assign employee
        mockMvc.perform(put("/api/appointments/" + appointmentId + "/assign")
                        .param("employeeId", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.assignedEmployeeId").value(10))
                .andExpect(jsonPath("$.data.isAssigned").value(true));

        // Verify in database
        Appointment updatedAppointment = appointmentRepository.findById(appointmentId).orElse(null);
        assertThat(updatedAppointment).isNotNull();
        assertThat(updatedAppointment.getStatus()).isEqualTo("IN_PROGRESS");
        assertThat(updatedAppointment.getIsAssigned()).isTrue();
        assertThat(updatedAppointment.getAssignedEmployeeId()).isEqualTo("10");
    }

    @Test
    void getAppointmentsByCustomerId_Success() throws Exception {
        // Create multiple appointments for same customer
        appointmentRepository.save(
                Appointment.builder()
                        .customerId(1L)
                        .fullName("John Doe")
                        .phoneNumber("(555) 123-4567")
                        .vehicleType("Toyota Corolla 2020")
                        .serviceType("Oil Change")
                        .bookingDateTime(LocalDateTime.now().plusDays(1))
                        .paymentMethod("Cash at Service Center")
                        .status("CREATED")
                        .isAssigned(false)
                        .duration(60)
                        .build()
        );

        appointmentRepository.save(
                Appointment.builder()
                        .customerId(1L)
                        .fullName("John Doe")
                        .phoneNumber("(555) 123-4567")
                        .vehicleType("Toyota Corolla 2020")
                        .serviceType("Brake Service")
                        .bookingDateTime(LocalDateTime.now().plusDays(2))
                        .paymentMethod("Card at Service Center")
                        .status("CREATED")
                        .isAssigned(false)
                        .duration(120)
                        .build()
        );

        // Get appointments for customer
        mockMvc.perform(get("/api/appointments/customer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].customerId").value(1))
                .andExpect(jsonPath("$.data[1].customerId").value(1));
    }

    @Test
    void getUnassignedAppointments_Success() throws Exception {
        // Create assigned and unassigned appointments
        appointmentRepository.save(
                Appointment.builder()
                        .customerId(1L)
                        .fullName("John Doe")
                        .phoneNumber("(555) 123-4567")
                        .vehicleType("Toyota Corolla 2020")
                        .serviceType("Oil Change")
                        .bookingDateTime(LocalDateTime.now().plusDays(1))
                        .paymentMethod("Cash at Service Center")
                        .status("CREATED")
                        .isAssigned(false)
                        .duration(60)
                        .build()
        );

        appointmentRepository.save(
                Appointment.builder()
                        .customerId(2L)
                        .fullName("Jane Smith")
                        .phoneNumber("(555) 987-6543")
                        .vehicleType("Honda Civic 2021")
                        .serviceType("Brake Service")
                        .bookingDateTime(LocalDateTime.now().plusDays(2))
                        .paymentMethod("Card at Service Center")
                        .status("IN_PROGRESS")
                        .isAssigned(true)
                        .assignedEmployeeId("10")
                        .duration(120)
                        .build()
        );

        // Get unassigned appointments
        mockMvc.perform(get("/api/appointments/unassigned"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].isAssigned").value(false))
                .andExpect(jsonPath("$.data[0].fullName").value("John Doe"));
    }

    @Test
    void validationErrors_ReturnBadRequest() throws Exception {
        AppointmentRequest invalidRequest = AppointmentRequest.builder()
                .customerId(null) // Required
                .fullName("") // Required
                .phoneNumber("123456") // Invalid format
                .vehicleType("Toyota")
                .serviceType("Oil Change")
                .bookingDateTime(LocalDateTime.now().plusDays(1))
                .paymentMethod("Cash")
                .duration(null) // Required
                .build();

        mockMvc.perform(post("/api/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}