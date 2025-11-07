package com.servexa.appointment.service;

import com.servexa.appointment.dto.AppointmentRequest;
import com.servexa.appointment.dto.AppointmentResponse;
import com.servexa.appointment.entity.Appointment;
import com.servexa.appointment.repository.AppointmentRepository;
import com.servexa.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        log.info("Creating new appointment for customer: {}", request.getCustomerId());
        
        Appointment appointment = Appointment.builder()
                .customerId(request.getCustomerId())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .vehicleType(request.getVehicleType())
                .serviceType(request.getServiceType())
                .bookingDateTime(request.getBookingDateTime())
                .additionalNote(request.getAdditionalNote())
                .paymentMethod(request.getPaymentMethod())
                .status("CREATED")
                .isAssigned(false)
                .duration(request.getDuration())
                .build();
        
        appointment = appointmentRepository.save(appointment);
        log.info("Appointment created successfully with ID: {}", appointment.getId());
        
        return mapToResponse(appointment);
    }
    
    public AppointmentResponse getAppointmentById(String id) {
        log.info("Fetching appointment with ID: {}", id);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        return mapToResponse(appointment);
    }
    
    public List<AppointmentResponse> getAppointmentsByCustomerId(Long customerId) {
        log.info("Fetching appointments for customer ID: {}", customerId);
        return appointmentRepository.findByCustomerId(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<AppointmentResponse> getAppointmentsByEmployeeId(String employeeId) {
        log.info("Fetching appointments for employee ID: {}", employeeId);
        return appointmentRepository.findByAssignedEmployeeId(employeeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<AppointmentResponse> getUnassignedAppointments() {
        log.info("Fetching unassigned appointments");
        return appointmentRepository.findByIsAssigned(false)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public AppointmentResponse updateAppointmentStatus(String id, String status) {
        log.info("Updating appointment {} status to: {}", id, status);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        
        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);
        
        return mapToResponse(appointment);
    }
    
    public AppointmentResponse assignEmployee(String appointmentId, String employeeId) {
        log.info("Assigning employee {} to appointment {}", employeeId, appointmentId);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + appointmentId));
        
        appointment.setAssignedEmployeeId(employeeId);
        appointment.setIsAssigned(true);
        appointment.setStatus("ASSIGNED");
        appointment = appointmentRepository.save(appointment);
        
        return mapToResponse(appointment);
    }
    
    public List<AppointmentResponse> getAllAppointments() {
        log.info("Fetching all appointments");
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<AppointmentResponse> getAppointmentsByStatus(String status) {
        log.info("Fetching appointments with status: {}", status);
        List<Appointment> appointments = appointmentRepository.findByStatus(status);
        return appointments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private AppointmentResponse mapToResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .customerId(appointment.getCustomerId())
                .fullName(appointment.getFullName())
                .phoneNumber(appointment.getPhoneNumber())
                .vehicleType(appointment.getVehicleType())
                .serviceType(appointment.getServiceType())
                .bookingDateTime(appointment.getBookingDateTime())
                .additionalNote(appointment.getAdditionalNote())
                .paymentMethod(appointment.getPaymentMethod())
                .status(appointment.getStatus())
                .isAssigned(appointment.getIsAssigned())
                .assignedEmployeeId(appointment.getAssignedEmployeeId())
                .duration(appointment.getDuration())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }
}