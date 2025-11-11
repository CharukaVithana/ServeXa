package com.servexa.vehicle.repository;

import com.servexa.vehicle.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByCustomerId(String customerId);

    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    
    boolean existsByRegistrationNumber(String registrationNumber);

    Optional<Vehicle> findByIdAndCustomerId(Long id, String customerId);

    void deleteByIdAndCustomerId(Long id, String customerId);
}