package com.servexa.customerservice.controller;

import com.servexa.customerservice.model.Customer;
import com.servexa.customerservice.model.Vehicle;
import com.servexa.customerservice.repository.CustomerRepository;
import com.servexa.customerservice.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
public class VehicleController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private CustomerRepository customerRepository;

    // Get all vehicles for a specific customer
    @GetMapping("/{id}/vehicles")
    public ResponseEntity<List<Vehicle>> getVehiclesByCustomerId(@PathVariable Long id) {
        List<Vehicle> vehicles = vehicleRepository.findByCustomerId(id);
        return ResponseEntity.ok(vehicles);
    }

    // Add new vehicle
    @PostMapping("/{id}/vehicles")
    public ResponseEntity<Vehicle> addVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        Optional<Customer> customerOpt = customerRepository.findById(id);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        vehicle.setCustomer(customerOpt.get());
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(savedVehicle);
    }

    // Update existing vehicle
    @PutMapping("/vehicles/{vehicleId}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long vehicleId, @RequestBody Vehicle updatedVehicle) {
        Optional<Vehicle> vehicleOpt = vehicleRepository.findById(vehicleId);
        if (vehicleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Vehicle existing = vehicleOpt.get();
        existing.setRegistrationNumber(updatedVehicle.getRegistrationNumber());
        existing.setModel(updatedVehicle.getModel());
        existing.setYear(updatedVehicle.getYear());
        existing.setColor(updatedVehicle.getColor());
        existing.setImageUrl(updatedVehicle.getImageUrl());
        Vehicle saved = vehicleRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    // Delete a vehicle
    @DeleteMapping("/vehicles/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            return ResponseEntity.notFound().build();
        }
        vehicleRepository.deleteById(vehicleId);
        return ResponseEntity.noContent().build();
    }
}
