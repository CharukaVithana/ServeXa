package com.servexa.vehicle.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VehicleTest {

    @Test
    void testPrePersist() {
        // Given
        Vehicle vehicle = new Vehicle();
        vehicle.setCustomerId("123e4567-e89b-12d3-a456-426614174000");
        vehicle.setRegistrationNumber("TEST123");
        vehicle.setMake("Toyota");
        vehicle.setModel("Camry");
        vehicle.setYear(2023);

        // When
        vehicle.onCreate();

        // Then
        assertThat(vehicle.getCreatedAt()).isNotNull();
        assertThat(vehicle.getUpdatedAt()).isNotNull();
        assertThat(vehicle.getCreatedAt()).isEqualTo(vehicle.getUpdatedAt());
    }

    @Test
    void testPreUpdate() throws InterruptedException {
        // Given
        Vehicle vehicle = new Vehicle();
        vehicle.setCustomerId("123e4567-e89b-12d3-a456-426614174000");
        vehicle.setRegistrationNumber("TEST123");
        vehicle.setMake("Toyota");
        vehicle.setModel("Camry");
        vehicle.setYear(2023);
        vehicle.onCreate();

        var createdAt = vehicle.getCreatedAt();

        // Small delay to ensure different timestamps
        Thread.sleep(10);

        // When
        vehicle.onUpdate();

        // Then
        assertThat(vehicle.getUpdatedAt()).isNotNull();
        assertThat(vehicle.getUpdatedAt()).isAfter(createdAt);
        assertThat(vehicle.getCreatedAt()).isEqualTo(createdAt);
    }
}
