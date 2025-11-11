package com.servexa.vehicle.service;

import com.servexa.common.client.NotificationClient;
import com.servexa.common.exception.BadRequestException;
import com.servexa.common.exception.ResourceNotFoundException;
import com.servexa.vehicle.dto.VehicleRequest;
import com.servexa.vehicle.dto.VehicleResponse;
import com.servexa.vehicle.entity.Vehicle;
import com.servexa.vehicle.repository.VehicleRepository;
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
public class VehicleService {
    
    private final VehicleRepository vehicleRepository;
    private final NotificationClient notificationClient;
    
    public VehicleResponse createVehicle(VehicleRequest request) {
        log.info("Creating new vehicle for customer: {}", request.getCustomerId());
        
        // Check if registration number already exists
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new BadRequestException("Vehicle with registration number already exists: " + request.getRegistrationNumber());
        }
        
        Vehicle vehicle = new Vehicle();
        vehicle.setCustomerId(request.getCustomerId());
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setColor(request.getColor());
        vehicle.setVin(request.getVin());
        vehicle.setImageUrl(request.getImageUrl());
        
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        log.info("Vehicle created successfully with ID: {}", savedVehicle.getId());
        
        // Send notification
        try {
            String message = String.format("Vehicle %s %s %s (Registration: %s) has been successfully added to your account.",
                    savedVehicle.getYear(),
                    savedVehicle.getMake(),
                    savedVehicle.getModel(),
                    savedVehicle.getRegistrationNumber());
            
            notificationClient.sendNotification(
                    savedVehicle.getCustomerId().toString(),
                    "Vehicle Added Successfully",
                    message,
                    NotificationClient.NotificationType.VEHICLE_ADDED
            );
        } catch (Exception e) {
            log.error("Failed to send notification for vehicle creation", e);
        }
        
        return mapToResponse(savedVehicle);
    }
    
    @Transactional(readOnly = true)
    public List<VehicleResponse> getVehiclesByCustomerId(Long customerId) {
        log.info("Fetching vehicles for customer: {}", customerId);
        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(customerId);
        return vehicles.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long id) {
        log.info("Fetching vehicle with ID: {}", id);
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
        return mapToResponse(vehicle);
    }
    
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        log.info("Updating vehicle with ID: {}", id);
        
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
        
        // Check if customer owns this vehicle
        if (!vehicle.getCustomerId().equals(request.getCustomerId())) {
            throw new BadRequestException("Vehicle does not belong to the specified customer");
        }
        
        // Check if registration number is being changed and already exists
        if (!vehicle.getRegistrationNumber().equals(request.getRegistrationNumber()) &&
            vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new BadRequestException("Vehicle with registration number already exists: " + request.getRegistrationNumber());
        }
        
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setColor(request.getColor());
        vehicle.setVin(request.getVin());
        vehicle.setImageUrl(request.getImageUrl());
        
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        log.info("Vehicle updated successfully");
        
        return mapToResponse(updatedVehicle);
    }
    
    public void deleteVehicle(Long id, Long customerId) {
        log.info("Deleting vehicle with ID: {} for customer: {}", id, customerId);
        
        Vehicle vehicle = vehicleRepository.findByIdAndCustomerId(id, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found or does not belong to customer"));
        
        vehicleRepository.delete(vehicle);
        log.info("Vehicle deleted successfully");
    }
    
    private VehicleResponse mapToResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .customerId(vehicle.getCustomerId())
                .registrationNumber(vehicle.getRegistrationNumber())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .color(vehicle.getColor())
                .vin(vehicle.getVin())
                .imageUrl(vehicle.getImageUrl())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}