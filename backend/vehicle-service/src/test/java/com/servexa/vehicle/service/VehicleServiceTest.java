package com.servexa.vehicle.service;

import com.servexa.common.client.NotificationClient;
import static com.servexa.common.client.NotificationClient.NotificationType;
import static com.servexa.common.client.NotificationClient.NotificationPriority;
import com.servexa.common.exception.BadRequestException;
import com.servexa.common.exception.ResourceNotFoundException;
import com.servexa.vehicle.dto.VehicleRequest;
import com.servexa.vehicle.dto.VehicleResponse;
import com.servexa.vehicle.entity.Vehicle;
import com.servexa.vehicle.repository.VehicleRepository;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private NotificationClient notificationClient;

    @InjectMocks
    private VehicleService vehicleService;

    private VehicleRequest vehicleRequest;
    private Vehicle vehicle;
    private final String customerId = "123e4567-e89b-12d3-a456-426614174000";

    @BeforeEach
    void setUp() {
        vehicleRequest = new VehicleRequest();
        vehicleRequest.setCustomerId(customerId);
        vehicleRequest.setRegistrationNumber("ABC123");
        vehicleRequest.setMake("Toyota");
        vehicleRequest.setModel("Camry");
        vehicleRequest.setYear(2023);
        vehicleRequest.setColor("Blue");
        vehicleRequest.setVin("1HGBH41JXMN109186");
        vehicleRequest.setImageUrl("http://example.com/image.jpg");

        vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setCustomerId(customerId);
        vehicle.setRegistrationNumber("ABC123");
        vehicle.setMake("Toyota");
        vehicle.setModel("Camry");
        vehicle.setYear(2023);
        vehicle.setColor("Blue");
        vehicle.setVin("1HGBH41JXMN109186");
        vehicle.setImageUrl("http://example.com/image.jpg");
        vehicle.setCreatedAt(LocalDateTime.now());
        vehicle.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void createVehicle_Success() {
        when(vehicleRepository.existsByRegistrationNumber(anyString())).thenReturn(false);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        VehicleResponse response = vehicleService.createVehicle(vehicleRequest);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getRegistrationNumber()).isEqualTo("ABC123");
        assertThat(response.getMake()).isEqualTo("Toyota");

        verify(vehicleRepository).existsByRegistrationNumber("ABC123");
        verify(vehicleRepository).save(any(Vehicle.class));
        verify(notificationClient).sendNotification(anyString(), anyString(), anyString(), any(NotificationType.class));
    }

    @Test
    void createVehicle_DuplicateRegistration_ThrowsException() {
        when(vehicleRepository.existsByRegistrationNumber(anyString())).thenReturn(true);

        assertThatThrownBy(() -> vehicleService.createVehicle(vehicleRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Vehicle with registration number already exists: ABC123");

        verify(vehicleRepository).existsByRegistrationNumber("ABC123");
        verify(vehicleRepository, never()).save(any(Vehicle.class));
        verify(notificationClient, never()).sendNotification(anyString(), anyString(), anyString(),
                any(NotificationType.class));
    }

    @Test
    void getVehiclesByCustomerId_Success() {
        List<Vehicle> vehicles = Arrays.asList(vehicle, createSecondVehicle());
        when(vehicleRepository.findByCustomerId(customerId)).thenReturn(vehicles);

        List<VehicleResponse> responses = vehicleService.getVehiclesByCustomerId(customerId);

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).getRegistrationNumber()).isEqualTo("ABC123");
        assertThat(responses.get(1).getRegistrationNumber()).isEqualTo("XYZ789");

        verify(vehicleRepository).findByCustomerId(customerId);
    }

    @Test
    void getVehiclesByCustomerId_EmptyList() {
        when(vehicleRepository.findByCustomerId(customerId)).thenReturn(Arrays.asList());

        List<VehicleResponse> responses = vehicleService.getVehiclesByCustomerId(customerId);

        assertThat(responses).isEmpty();
        verify(vehicleRepository).findByCustomerId(customerId);
    }

    @Test
    void getVehicleById_Success() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        VehicleResponse response = vehicleService.getVehicleById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getRegistrationNumber()).isEqualTo("ABC123");

        verify(vehicleRepository).findById(1L);
    }

    @Test
    void getVehicleById_NotFound() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.getVehicleById(1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Vehicle not found with ID: 1");

        verify(vehicleRepository).findById(1L);
    }

    @Test
    void updateVehicle_Success() {
        VehicleRequest updateRequest = new VehicleRequest();
        updateRequest.setCustomerId(customerId);
        updateRequest.setRegistrationNumber("ABC123");
        updateRequest.setMake("Toyota");
        updateRequest.setModel("Corolla");
        updateRequest.setYear(2024);
        updateRequest.setColor("Red");
        updateRequest.setVin("1HGBH41JXMN109187");
        updateRequest.setImageUrl("http://example.com/image2.jpg");

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        VehicleResponse response = vehicleService.updateVehicle(1L, updateRequest);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);

        verify(vehicleRepository).findById(1L);
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    void updateVehicle_NotFound() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.updateVehicle(1L, vehicleRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Vehicle not found with ID: 1");

        verify(vehicleRepository).findById(1L);
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    void updateVehicle_WrongCustomer() {
        VehicleRequest wrongCustomerRequest = new VehicleRequest();
        wrongCustomerRequest.setCustomerId("wrong-customer-id");
        wrongCustomerRequest.setRegistrationNumber("ABC123");
        wrongCustomerRequest.setMake("Toyota");
        wrongCustomerRequest.setModel("Corolla");
        wrongCustomerRequest.setYear(2024);

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        assertThatThrownBy(() -> vehicleService.updateVehicle(1L, wrongCustomerRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Vehicle does not belong to the specified customer");

        verify(vehicleRepository).findById(1L);
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    void deleteVehicle_Success() {
        when(vehicleRepository.findByIdAndCustomerId(1L, customerId)).thenReturn(Optional.of(vehicle));

        vehicleService.deleteVehicle(1L, customerId);

        verify(vehicleRepository).findByIdAndCustomerId(1L, customerId);
        verify(vehicleRepository).delete(vehicle);
    }

    @Test
    void deleteVehicle_NotFound() {
        when(vehicleRepository.findByIdAndCustomerId(1L, customerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.deleteVehicle(1L, customerId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Vehicle not found or does not belong to customer");

        verify(vehicleRepository).findByIdAndCustomerId(1L, customerId);
        verify(vehicleRepository, never()).delete(any(Vehicle.class));
    }

    private Vehicle createSecondVehicle() {
        Vehicle secondVehicle = new Vehicle();
        secondVehicle.setId(2L);
        secondVehicle.setCustomerId(customerId);
        secondVehicle.setRegistrationNumber("XYZ789");
        secondVehicle.setMake("Honda");
        secondVehicle.setModel("Civic");
        secondVehicle.setYear(2023);
        secondVehicle.setColor("Black");
        secondVehicle.setCreatedAt(LocalDateTime.now());
        secondVehicle.setUpdatedAt(LocalDateTime.now());
        return secondVehicle;
    }
}