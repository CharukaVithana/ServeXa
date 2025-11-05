package com.servexa.appointment.service;

import com.servexa.appointment.dto.AppointmentRequest;
import com.servexa.appointment.dto.AppointmentResponse;
import com.servexa.appointment.entity.Appointment;
import com.servexa.appointment.repository.AppointmentRepository;
import com.servexa.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private AppointmentService appointmentService;

    private AppointmentRequest appointmentRequest;
    private Appointment appointment;

    @BeforeEach
    void setUp() {
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

        appointment = Appointment.builder()
                .customerId(1L)
                .fullName("John Doe")
                .phoneNumber("(555) 123-4567")
                .vehicleType("Toyota Corolla 2020")
                .serviceType("Oil Change")
                .bookingDateTime(LocalDateTime.now().plusDays(1))
                .additionalNote("Please check brakes")
                .paymentMethod("Cash at Service Center")
                .status("CREATED")
                .isAssigned(false)
                .duration(60)
                .build();
    }

    @Test
    void createAppointment_Success() {
        appointment.setId("generated-uuid-1");
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.createAppointment(appointmentRequest);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isNotNull();
        assertThat(response.getCustomerId()).isEqualTo(appointmentRequest.getCustomerId());
        assertThat(response.getFullName()).isEqualTo(appointmentRequest.getFullName());
        assertThat(response.getStatus()).isEqualTo("CREATED");
        assertThat(response.getIsAssigned()).isFalse();
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void getAppointmentById_Success() {
        String appointmentId = "test-id-1";
        appointment.setId(appointmentId);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));

        AppointmentResponse response = appointmentService.getAppointmentById(appointmentId);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(appointmentId);
        verify(appointmentRepository, times(1)).findById(appointmentId);
    }

    @Test
    void getAppointmentById_NotFound() {
        String nonExistentId = "non-existent-id";
        when(appointmentRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.getAppointmentById(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Appointment not found with ID: " + nonExistentId);
    }

    @Test
    void getAppointmentsByCustomerId_Success() {
        appointment.setId("test-id-1");
        List<Appointment> appointments = Arrays.asList(appointment);
        when(appointmentRepository.findByCustomerId(1L)).thenReturn(appointments);

        List<AppointmentResponse> responses = appointmentService.getAppointmentsByCustomerId(1L);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getCustomerId()).isEqualTo(1L);
        verify(appointmentRepository, times(1)).findByCustomerId(1L);
    }

    @Test
    void getAppointmentsByEmployeeId_Success() {
        appointment.setId("test-id-1");
        appointment.setAssignedEmployeeId(10L);
        appointment.setIsAssigned(true);
        List<Appointment> appointments = Arrays.asList(appointment);
        when(appointmentRepository.findByAssignedEmployeeId(10L)).thenReturn(appointments);

        List<AppointmentResponse> responses = appointmentService.getAppointmentsByEmployeeId(10L);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getAssignedEmployeeId()).isEqualTo(10L);
        verify(appointmentRepository, times(1)).findByAssignedEmployeeId(10L);
    }

    @Test
    void getUnassignedAppointments_Success() {
        appointment.setId("test-id-1");
        List<Appointment> appointments = Arrays.asList(appointment);
        when(appointmentRepository.findByIsAssigned(false)).thenReturn(appointments);

        List<AppointmentResponse> responses = appointmentService.getUnassignedAppointments();

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getIsAssigned()).isFalse();
        verify(appointmentRepository, times(1)).findByIsAssigned(false);
    }

    @Test
    void updateAppointmentStatus_Success() {
        String appointmentId = "test-id-1";
        appointment.setId(appointmentId);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.updateAppointmentStatus(appointmentId, "IN_PROGRESS");

        assertThat(response).isNotNull();
        assertThat(appointment.getStatus()).isEqualTo("IN_PROGRESS");
        verify(appointmentRepository, times(1)).findById(appointmentId);
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void updateAppointmentStatus_NotFound() {
        String nonExistentId = "non-existent-id";
        when(appointmentRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.updateAppointmentStatus(nonExistentId, "IN_PROGRESS"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Appointment not found with ID: " + nonExistentId);
    }

    @Test
    void assignEmployee_Success() {
        String appointmentId = "test-id-1";
        appointment.setId(appointmentId);
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.assignEmployee(appointmentId, 10L);

        assertThat(response).isNotNull();
        assertThat(appointment.getAssignedEmployeeId()).isEqualTo(10L);
        assertThat(appointment.getIsAssigned()).isTrue();
        verify(appointmentRepository, times(1)).findById(appointmentId);
        verify(appointmentRepository, times(1)).save(appointment);
    }

    @Test
    void assignEmployee_AppointmentNotFound() {
        String nonExistentId = "non-existent-id";
        when(appointmentRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.assignEmployee(nonExistentId, 10L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Appointment not found with ID: " + nonExistentId);
    }
}