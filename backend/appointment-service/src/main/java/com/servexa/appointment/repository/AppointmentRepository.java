package com.servexa.appointment.repository;

import com.servexa.appointment.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {

    List<Appointment> findByCustomerId(String customerId);

    List<Appointment> findByAssignedEmployeeId(String employeeId);

    List<Appointment> findByStatus(String status);

    List<Appointment> findByIsAssigned(Boolean isAssigned);

    List<Appointment> findByIsAssignedFalse();
    
    List<Appointment> findByBookingDateTimeBetweenAndStatusNot(LocalDateTime start, LocalDateTime end, String status);
}