package com.servexa.appointment.repository;

import com.servexa.appointment.entity.Appointment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class AppointmentRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private Appointment appointment1;
    private Appointment appointment2;

    @BeforeEach
    void setUp() {
        appointment1 = Appointment.builder()
                .customerId(1L)
                .fullName("John Doe")
                .phoneNumber("(555) 123-4567")
                .vehicleType("Toyota Corolla 2020")
                .serviceType("Oil Change")
                .bookingDateTime(LocalDateTime.now().plusDays(1))
                .additionalNote("Please check brakes")
                .paymentMethod("Cash at Service Center")
                .status("CREATED")
                .isAssigned(false)
                .duration(60)
                .build();

        appointment2 = Appointment.builder()
                .customerId(2L)
                .fullName("Jane Smith")
                .phoneNumber("(555) 987-6543")
                .vehicleType("Honda Civic 2021")
                .serviceType("Brake Service")
                .bookingDateTime(LocalDateTime.now().plusDays(2))
                .additionalNote("Urgent repair needed")
                .paymentMethod("Card at Service Center")
                .status("IN_PROGRESS")
                .isAssigned(true)
                .assignedEmployeeId("10")
                .duration(120)
                .build();

        entityManager.persist(appointment1);
        entityManager.persist(appointment2);
        entityManager.flush();
    }

    @Test
    void findByCustomerId_Success() {
        List<Appointment> appointments = appointmentRepository.findByCustomerId(1L);

        assertThat(appointments).hasSize(1);
        assertThat(appointments.get(0).getFullName()).isEqualTo("John Doe");
        assertThat(appointments.get(0).getCustomerId()).isEqualTo(1L);
    }

    @Test
    void findByCustomerId_NoResults() {
        List<Appointment> appointments = appointmentRepository.findByCustomerId(999L);

        assertThat(appointments).isEmpty();
    }

    @Test
    void findByAssignedEmployeeId_Success() {
        List<Appointment> appointments = appointmentRepository.findByAssignedEmployeeId("10");

        assertThat(appointments).hasSize(1);
        assertThat(appointments.get(0).getFullName()).isEqualTo("Jane Smith");
        assertThat(appointments.get(0).getAssignedEmployeeId()).isEqualTo("10");
    }

    @Test
    void findByAssignedEmployeeId_NoResults() {
        List<Appointment> appointments = appointmentRepository.findByAssignedEmployeeId("999");

        assertThat(appointments).isEmpty();
    }

    @Test
    void findByStatus_Success() {
        List<Appointment> createdAppointments = appointmentRepository.findByStatus("CREATED");
        List<Appointment> inProgressAppointments = appointmentRepository.findByStatus("IN_PROGRESS");

        assertThat(createdAppointments).hasSize(1);
        assertThat(createdAppointments.get(0).getFullName()).isEqualTo("John Doe");
        
        assertThat(inProgressAppointments).hasSize(1);
        assertThat(inProgressAppointments.get(0).getFullName()).isEqualTo("Jane Smith");
    }

    @Test
    void findByIsAssigned_Success() {
        List<Appointment> unassignedAppointments = appointmentRepository.findByIsAssigned(false);
        List<Appointment> assignedAppointments = appointmentRepository.findByIsAssigned(true);

        assertThat(unassignedAppointments).hasSize(1);
        assertThat(unassignedAppointments.get(0).getFullName()).isEqualTo("John Doe");
        assertThat(unassignedAppointments.get(0).getIsAssigned()).isFalse();
        
        assertThat(assignedAppointments).hasSize(1);
        assertThat(assignedAppointments.get(0).getFullName()).isEqualTo("Jane Smith");
        assertThat(assignedAppointments.get(0).getIsAssigned()).isTrue();
    }

    @Test
    void saveAppointment_Success() {
        Appointment newAppointment = Appointment.builder()
                .customerId(3L)
                .fullName("Bob Johnson")
                .phoneNumber("(555) 456-7890")
                .vehicleType("Ford F-150 2022")
                .serviceType("Tire Replacement")
                .bookingDateTime(LocalDateTime.now().plusDays(3))
                .paymentMethod("Online Payment")
                .status("CREATED")
                .isAssigned(false)
                .duration(90)
                .build();

        Appointment savedAppointment = appointmentRepository.save(newAppointment);

        assertThat(savedAppointment.getId()).isNotNull();
        assertThat(savedAppointment.getFullName()).isEqualTo("Bob Johnson");
        assertThat(savedAppointment.getStatus()).isEqualTo("CREATED");
        assertThat(savedAppointment.getIsAssigned()).isFalse();
    }

    @Test
    void updateAppointment_Success() {
        Appointment appointment = appointmentRepository.findById(appointment1.getId()).orElse(null);
        assertThat(appointment).isNotNull();

        appointment.setStatus("COMPLETED");
        appointment.setIsAssigned(true);
        appointment.setAssignedEmployeeId("20");

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        assertThat(updatedAppointment.getStatus()).isEqualTo("COMPLETED");
        assertThat(updatedAppointment.getIsAssigned()).isTrue();
        assertThat(updatedAppointment.getAssignedEmployeeId()).isEqualTo("20");
    }
}