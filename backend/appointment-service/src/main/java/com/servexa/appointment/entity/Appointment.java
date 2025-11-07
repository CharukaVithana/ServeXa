package com.servexa.appointment.entity;

import com.servexa.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment extends BaseEntity {

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String vehicleType;

    @Column(nullable = false)
    private String serviceType;

    @Column(nullable = false)
    private LocalDateTime bookingDateTime;

    @Column(columnDefinition = "TEXT")
    private String additionalNote;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private String status = "CREATED";

    @Column(nullable = false)
    private Boolean isAssigned = false;

    @Column
    private String assignedEmployeeId;

    @Column(nullable = false)
    private Integer duration;
}