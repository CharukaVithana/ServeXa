package com.servexa.vehicle.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.servexa.vehicle.dto.VehicleRequest;
import com.servexa.vehicle.entity.Vehicle;
import com.servexa.vehicle.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class VehicleIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private VehicleRepository vehicleRepository;

        private VehicleRequest vehicleRequest;
        private final String customerId = "123e4567-e89b-12d3-a456-426614174000";

        @BeforeEach
        void setUp() {
                vehicleRepository.deleteAll();

                vehicleRequest = new VehicleRequest();
                vehicleRequest.setCustomerId(customerId);
                vehicleRequest.setRegistrationNumber("ABC123");
                vehicleRequest.setMake("Toyota");
                vehicleRequest.setModel("Camry");
                vehicleRequest.setYear(2023);
                vehicleRequest.setColor("Blue");
                vehicleRequest.setVin("1HGBH41JXMN109186");
                vehicleRequest.setImageUrl("http://example.com/image.jpg");
        }

        @Test
        void testValidationErrors() throws Exception {
                // Test missing registration number
                VehicleRequest invalidRequest = new VehicleRequest();
                invalidRequest.setCustomerId(customerId);
                invalidRequest.setRegistrationNumber("");
                invalidRequest.setMake("Toyota");
                invalidRequest.setModel("Camry");
                invalidRequest.setYear(2023);

                mockMvc.perform(post("/api/vehicles")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRequest)))
                                .andExpect(status().isBadRequest());

                // Test invalid year
                invalidRequest = new VehicleRequest();
                invalidRequest.setCustomerId(customerId);
                invalidRequest.setRegistrationNumber("TEST123");
                invalidRequest.setMake("Toyota");
                invalidRequest.setModel("Camry");
                invalidRequest.setYear(1800); // Too old

                mockMvc.perform(post("/api/vehicles")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRequest)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void testGetVehiclesForNonExistentCustomer() throws Exception {
                mockMvc.perform(get("/api/vehicles/customer/{customerId}", "non-existent-customer"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data", hasSize(0)));
        }
}