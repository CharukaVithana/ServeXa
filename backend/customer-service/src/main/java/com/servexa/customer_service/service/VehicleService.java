package com.servexa.customerservice.service;

import com.servexa.customerservice.dto.VehicleRequest;
import com.servexa.customerservice.dto.VehicleResponse;
import com.servexa.customerservice.model.Customer;
import com.servexa.customerservice.model.Vehicle;
import com.servexa.customerservice.repository.CustomerRepository;
import com.servexa.customerservice.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    @Autowired
    public VehicleService(VehicleRepository vehicleRepository, CustomerRepository customerRepository) {
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
    }

    /**
     * Add a new vehicle for a customer
     */
    public VehicleResponse addVehicle(VehicleRequest request) {
        // Validate customer exists
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + request.getCustomerId()));

        // Create new vehicle entity
        Vehicle vehicle = new Vehicle();
        vehicle.setModel(request.getModel());
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setImageUrl(request.getImageUrl());
        
        // Handle year conversion (String to int)
        if (request.getYear() != null && !request.getYear().isEmpty()) {
            try {
                vehicle.setYear(Integer.parseInt(request.getYear()));
            } catch (NumberFormatException e) {
                // If year is not a valid number, set to 0 or current year
                vehicle.setYear(0);
            }
        } else {
            vehicle.setYear(0);
        }
        
        vehicle.setColor(request.getColor());
        vehicle.setCustomer(customer);

        // Save vehicle
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        // Convert to response DTO
        return mapToResponse(savedVehicle);
    }

    /**
     * Get all vehicles for a specific customer
     */
    @Transactional(readOnly = true)
    public List<VehicleResponse> getVehiclesByCustomerId(Long customerId) {
        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(customerId);
        return vehicles.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a vehicle by ID
     */
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + id));
        return mapToResponse(vehicle);
    }

    /**
     * Update an existing vehicle
     */
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        // Find existing vehicle
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + id));

        // Validate customer exists if customerId is being updated
        if (!vehicle.getCustomer().getId().equals(request.getCustomerId())) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + request.getCustomerId()));
            vehicle.setCustomer(customer);
        }

        // Update vehicle fields
        vehicle.setModel(request.getModel());
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setImageUrl(request.getImageUrl());
        
        // Handle year conversion (String to int)
        if (request.getYear() != null && !request.getYear().isEmpty()) {
            try {
                vehicle.setYear(Integer.parseInt(request.getYear()));
            } catch (NumberFormatException e) {
                // If year is not a valid number, keep existing year
            }
        }
        
        if (request.getColor() != null) {
            vehicle.setColor(request.getColor());
        }

        // Save updated vehicle
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);

        // Convert to response DTO
        return mapToResponse(updatedVehicle);
    }

    /**
     * Delete a vehicle by ID
     */
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vehicle not found with ID: " + id);
        }
        vehicleRepository.deleteById(id);
    }

    /**
     * Map Vehicle entity to VehicleResponse DTO
     */
    private VehicleResponse mapToResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .model(vehicle.getModel())
                .registrationNumber(vehicle.getRegistrationNumber())
                .imageUrl(vehicle.getImageUrl())
                .year(vehicle.getYear() > 0 ? String.valueOf(vehicle.getYear()) : "")
                .color(vehicle.getColor() != null ? vehicle.getColor() : "")
                .customerId(vehicle.getCustomer().getId())
                .build();
    }
}

