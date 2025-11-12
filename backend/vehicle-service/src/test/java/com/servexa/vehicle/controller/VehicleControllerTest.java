package com.servexa.vehicle.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.servexa.vehicle.dto.VehicleRequest;
import com.servexa.vehicle.dto.VehicleResponse;
import com.servexa.vehicle.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VehicleController.class)
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VehicleService vehicleService;

    private VehicleRequest vehicleRequest;
    private VehicleResponse vehicleResponse;
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

        vehicleResponse = VehicleResponse.builder()
                .id(1L)
                .customerId(customerId)
                .registrationNumber("ABC123")
                .make("Toyota")
                .model("Camry")
                .year(2023)
                .color("Blue")
                .vin("1HGBH41JXMN109186")
                .imageUrl("http://example.com/image.jpg")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }



    @Test
    void createVehicle_ValidationError() throws Exception {
        VehicleRequest invalidRequest = new VehicleRequest();
        invalidRequest.setCustomerId(customerId);
        invalidRequest.setRegistrationNumber("");  // Empty registration number
        invalidRequest.setMake("Toyota");
        invalidRequest.setModel("Camry");
        invalidRequest.setYear(2023);

        mockMvc.perform(post("/api/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(vehicleService, never()).createVehicle(any(VehicleRequest.class));
    }



    @Test
    void getVehiclesByCustomerId_Success() throws Exception {
        List<VehicleResponse> vehicles = Arrays.asList(vehicleResponse, createSecondVehicleResponse());
        when(vehicleService.getVehiclesByCustomerId(customerId)).thenReturn(vehicles);

        mockMvc.perform(get("/api/vehicles/customer/{customerId}", customerId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].registrationNumber").value("ABC123"))
                .andExpect(jsonPath("$.data[1].registrationNumber").value("XYZ789"));

        verify(vehicleService).getVehiclesByCustomerId(customerId);
    }

    @Test
    void getVehiclesByCustomerId_EmptyList() throws Exception {
        when(vehicleService.getVehiclesByCustomerId(customerId)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/vehicles/customer/{customerId}", customerId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(0)));

        verify(vehicleService).getVehiclesByCustomerId(customerId);
    }


    @Test
    void getVehicleById_Success() throws Exception {
        when(vehicleService.getVehicleById(1L)).thenReturn(vehicleResponse);

        mockMvc.perform(get("/api/vehicles/{id}", 1L))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.registrationNumber").value("ABC123"));

        verify(vehicleService).getVehicleById(1L);
    }



    @Test
    void updateVehicle_Success() throws Exception {
        VehicleResponse updatedResponse = VehicleResponse.builder()
                .id(1L)
                .customerId(customerId)
                .registrationNumber("ABC123")
                .make("Toyota")
                .model("Corolla")
                .year(2024)
                .color("Red")
                .vin("1HGBH41JXMN109187")
                .imageUrl("http://example.com/image2.jpg")
                .createdAt(vehicleResponse.getCreatedAt())
                .updatedAt(LocalDateTime.now())
                .build();

        when(vehicleService.updateVehicle(eq(1L), any(VehicleRequest.class))).thenReturn(updatedResponse);

        mockMvc.perform(put("/api/vehicles/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.model").value("Corolla"))
                .andExpect(jsonPath("$.data.year").value(2024))
                .andExpect(jsonPath("$.data.color").value("Red"));

        verify(vehicleService).updateVehicle(eq(1L), any(VehicleRequest.class));
    }

    @Test
    void updateVehicle_ValidationError() throws Exception {
        VehicleRequest invalidRequest = new VehicleRequest();
        invalidRequest.setCustomerId(customerId);
        invalidRequest.setRegistrationNumber("ABC123");
        invalidRequest.setMake("");  // Empty make
        invalidRequest.setModel("Camry");
        invalidRequest.setYear(2023);

        mockMvc.perform(put("/api/vehicles/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andDo(print())
                .andExpect(status().isBadRequest());

        verify(vehicleService, never()).updateVehicle(anyLong(), any(VehicleRequest.class));
    }

    @Test
    void deleteVehicle_Success() throws Exception {
        doNothing().when(vehicleService).deleteVehicle(1L, customerId);

        mockMvc.perform(delete("/api/vehicles/{id}/customer/{customerId}", 1L, customerId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Vehicle deleted successfully"));

        verify(vehicleService).deleteVehicle(1L, customerId);
    }



    private VehicleResponse createSecondVehicleResponse() {
        return VehicleResponse.builder()
                .id(2L)
                .customerId(customerId)
                .registrationNumber("XYZ789")
                .make("Honda")
                .model("Civic")
                .year(2023)
                .color("Black")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}