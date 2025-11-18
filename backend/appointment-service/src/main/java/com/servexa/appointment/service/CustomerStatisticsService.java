package com.servexa.appointment.service;

import com.servexa.appointment.dto.CustomerStatisticsResponse;
import com.servexa.appointment.entity.Appointment;
import com.servexa.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerStatisticsService {

    private final AppointmentRepository appointmentRepository;
    private final WebClient.Builder webClientBuilder;

    public CustomerStatisticsResponse getCustomerStatistics(String customerId) {
        List<Appointment> appointments = appointmentRepository.findByCustomerId(customerId);
        
        int activeServices = (int) appointments.stream()
                .filter(a -> "IN_PROGRESS".equals(a.getStatus()))
                .count();
        
        int pastServices = (int) appointments.stream()
                .filter(a -> "COMPLETED".equals(a.getStatus()))
                .count();
        
        int upcomingAppointments = (int) appointments.stream()
                .filter(a -> ("SCHEDULED".equals(a.getStatus()) || "CREATED".equals(a.getStatus())) && 
                       a.getBookingDateTime().isAfter(LocalDateTime.now()))
                .count();
        
        int totalServices = appointments.size();
        
        // Calculate total spent from completed appointments
        // For now, we'll use a placeholder value as the cost field is not in the entity
        double totalSpent = pastServices * 100.0; // Placeholder: $100 per completed service
        
        // Calculate average rating - placeholder for now as rating is not in the entity
        double averageRating = 4.5; // Placeholder value
        
        // Get vehicle count from vehicle service
        Integer vehicleCount = getVehicleCount(customerId).block();
        
        return CustomerStatisticsResponse.builder()
                .activeServices(activeServices)
                .totalVehicles(vehicleCount != null ? vehicleCount : 0)
                .pastServices(pastServices)
                .upcomingAppointments(upcomingAppointments)
                .totalSpent(totalSpent)
                .averageRating(averageRating)
                .totalServices(totalServices)
                .build();
    }
    
    private Mono<Integer> getVehicleCount(String customerId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri("http://vehicle-service/api/vehicles/customer/{customerId}/count", customerId)
                    .retrieve()
                    .bodyToMono(Integer.class)
                    .onErrorReturn(0);
        } catch (Exception e) {
            return Mono.just(0);
        }
    }
}