package com.servexa.booking.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, length = 32)
    private String phone;

    @Column(nullable = false, length = 64)
    private String vehicleType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ServiceType serviceType;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false)
    private LocalTime bookingTime;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(nullable = false, length = 32)
    private String paymentMethod; // CASH, CARD_AT_SERVICE_CENTER, ONLINE, etc.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private Status status;

    @Column(nullable = false)
    private boolean isAssigned;

    @Column(columnDefinition = "uuid")
    private UUID assignedEmployeeId; // nullable

    @Column(nullable = false)
    private Integer duration; // minutes

    @Column(nullable = false, columnDefinition = "uuid")
    private UUID customerId;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    public enum Status {
        CREATED,      // default
        CONFIRMED,
        COMPLETED,
        CANCELLED
    }

    // Explicit no-arg constructor (replaces Lombok @NoArgsConstructor)
    public Booking() {}

    // Getters and setters (replaces Lombok @Getter/@Setter)
    public java.util.UUID getId() { return id; }
    public void setId(java.util.UUID id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public ServiceType getServiceType() { return serviceType; }
    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }

    public java.time.LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(java.time.LocalDate bookingDate) { this.bookingDate = bookingDate; }

    public java.time.LocalTime getBookingTime() { return bookingTime; }
    public void setBookingTime(java.time.LocalTime bookingTime) { this.bookingTime = bookingTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public boolean isAssigned() { return isAssigned; }
    public void setAssigned(boolean assigned) { isAssigned = assigned; }

    public java.util.UUID getAssignedEmployeeId() { return assignedEmployeeId; }
    public void setAssignedEmployeeId(java.util.UUID assignedEmployeeId) { this.assignedEmployeeId = assignedEmployeeId; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public java.util.UUID getCustomerId() { return customerId; }
    public void setCustomerId(java.util.UUID customerId) { this.customerId = customerId; }

    public java.time.OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public java.time.OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    public void prePersist() {
        if (status == null) status = Status.CREATED;
        isAssigned = (assignedEmployeeId != null);
    }
}
