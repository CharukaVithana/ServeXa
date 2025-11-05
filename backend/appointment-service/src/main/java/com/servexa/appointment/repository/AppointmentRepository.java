package com.servexa.appointment.repository;

import com.servexa.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    
    List<Appointment> findByCustomerId(Long customerId);
    
    List<Appointment> findByAssignedEmployeeId(Long employeeId);
    
    List<Appointment> findByStatus(String status);
    
    List<Appointment> findByIsAssigned(Boolean isAssigned);
}