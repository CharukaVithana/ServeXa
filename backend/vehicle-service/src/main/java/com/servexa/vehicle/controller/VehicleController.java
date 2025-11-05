package com.servexa.vehicle.controller;

import com.servexa.common.dto.ApiResponse;
import com.servexa.vehicle.dto.VehicleRequest;
import com.servexa.vehicle.dto.VehicleResponse;
import com.servexa.vehicle.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VehicleController {
    
    private final VehicleService vehicleService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = vehicleService.createVehicle(request);
        return new ResponseEntity<>(
                ApiResponse.success(response, "Vehicle created successfully"),
                HttpStatus.CREATED
        );
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getVehiclesByCustomerId(@PathVariable Long customerId) {
        List<VehicleResponse> vehicles = vehicleService.getVehiclesByCustomerId(customerId);
        return ResponseEntity.ok(
                ApiResponse.success(vehicles, "Vehicles fetched successfully")
        );
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long id) {
        VehicleResponse response = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(
                ApiResponse.success(response, "Vehicle fetched successfully")
        );
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(
                ApiResponse.success(response, "Vehicle updated successfully")
        );
    }
    
    @DeleteMapping("/{id}/customer/{customerId}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            @PathVariable Long id,
            @PathVariable Long customerId) {
        vehicleService.deleteVehicle(id, customerId);
        return ResponseEntity.ok(
                ApiResponse.success(null, "Vehicle deleted successfully")
        );
    }
}