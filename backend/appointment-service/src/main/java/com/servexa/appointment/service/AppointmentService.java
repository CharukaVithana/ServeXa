package com.servexa.appointment.service;

import com.servexa.appointment.dto.AppointmentRequest;
import com.servexa.appointment.dto.AppointmentResponse;
import com.servexa.appointment.entity.Appointment;
import com.servexa.appointment.repository.AppointmentRepository;
import com.servexa.common.client.NotificationClient;
import com.servexa.common.client.NotificationClient.NotificationType;
import com.servexa.common.client.NotificationClient.NotificationPriority;
import com.servexa.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final RestTemplate restTemplate;
    private final NotificationClient notificationClient;
    
    @Value("${vehicle.service.url:http://localhost:8084}")
    private String vehicleServiceUrl;

    public AppointmentResponse createAppointment(AppointmentRequest request) {
        log.info("Creating new appointment for customer: {}", request.getCustomerId());

        // Fetch vehicle details from vehicle service
        String vehicleType = request.getVehicleType();
        if (vehicleType == null || vehicleType.isEmpty()) {
            try {
                // Call vehicle service to get vehicle details
                var vehicleResponse = restTemplate.getForObject(
                    vehicleServiceUrl + "/api/vehicles/" + request.getVehicleId(),
                    VehicleDto.class
                );
                if (vehicleResponse != null) {
                    vehicleType = vehicleResponse.getMake() + " " + vehicleResponse.getModel() + " " + vehicleResponse.getYear();
                }
            } catch (Exception e) {
                log.warn("Could not fetch vehicle details for ID: {}", request.getVehicleId(), e);
                vehicleType = "Vehicle ID: " + request.getVehicleId();
            }
        }

        Appointment appointment = Appointment.builder()
                .customerId(request.getCustomerId())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .vehicleId(request.getVehicleId())
                .vehicleType(vehicleType)
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
        
        // Send notification to customer
        try {
            String title = "Appointment Confirmed";
            String message = String.format("Your appointment for %s on %s has been confirmed. Appointment ID: %s",
                    appointment.getServiceType(),
                    appointment.getBookingDateTime().toString(),
                    appointment.getId());
            
            notificationClient.sendNotification(
                    request.getCustomerId(),
                    title,
                    message,
                    NotificationType.APPOINTMENT_CREATED,
                    NotificationPriority.HIGH,
                    Map.of("appointmentId", appointment.getId(),
                           "serviceType", appointment.getServiceType())
            );
        } catch (Exception e) {
            log.error("Failed to send notification for appointment: {}", appointment.getId(), e);
            // Don't fail the appointment creation if notification fails
        }

        return mapToResponse(appointment);
    }

    public AppointmentResponse getAppointmentById(String id) {
        log.info("Fetching appointment with ID: {}", id);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> getAppointmentsByCustomerId(String customerId) {
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

        String previousStatus = appointment.getStatus();
        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);
        
        // Send notification based on status change
        try {
            String title = "";
            String message = "";
            NotificationType notificationType = NotificationType.APPOINTMENT_UPDATED;
            NotificationPriority priority = NotificationPriority.NORMAL;
            
            switch (status.toUpperCase()) {
                case "CANCELLED":
                    title = "Appointment Cancelled";
                    message = String.format("Your appointment for %s on %s has been cancelled.",
                            appointment.getServiceType(),
                            appointment.getBookingDateTime().toString());
                    notificationType = NotificationType.APPOINTMENT_CANCELLED;
                    priority = NotificationPriority.HIGH;
                    break;
                case "COMPLETED":
                    title = "Service Completed";
                    message = String.format("Your %s service has been completed. Thank you for choosing ServeXa!",
                            appointment.getServiceType());
                    notificationType = NotificationType.SERVICE_COMPLETED;
                    break;
                case "IN_PROGRESS":
                    title = "Service Started";
                    message = String.format("Your %s service is now in progress.",
                            appointment.getServiceType());
                    break;
                default:
                    title = "Appointment Status Updated";
                    message = String.format("Your appointment status has been updated to: %s", status);
            }
            
            notificationClient.sendNotification(
                    appointment.getCustomerId(),
                    title,
                    message,
                    notificationType,
                    priority,
                    Map.of("appointmentId", appointment.getId(),
                           "previousStatus", previousStatus,
                           "newStatus", status)
            );
        } catch (Exception e) {
            log.error("Failed to send notification for appointment status update: {}", appointment.getId(), e);
        }

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
                .vehicleId(appointment.getVehicleId())
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
    
    // Inner class for vehicle response
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class VehicleDto {
        private String id;
        private String make;
        private String model;
        private Integer year;
        private String registrationNumber;
    }
}