package com.servexa.employee.entity;

import com.servexa.common.entity.BaseEntity;
import com.servexa.employee.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task extends BaseEntity {

    @Column(name = "task_number", unique = true, nullable = false)
    private String taskNumber; // e.g., #SRV-2024-003

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "vehicle_model", nullable = false)
    private String vehicleModel;

    @Column(name = "service_type", nullable = false)
    private String serviceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.ASSIGNED;

    @Column(name = "duration")
    private Long duration; // Duration in minutes

    @Column(name = "estimated_duration")
    private String estimatedDuration; // e.g., "120m", "2h", "1.5h"

    @Column(name = "due_time")
    private LocalTime dueTime; // e.g., 3:30 PM

    @Column(name = "is_urgent")
    @Builder.Default
    private Boolean isUrgent = false;

    @Column(name = "completion_time")
    private LocalDateTime completionTime;

    @Column(name = "start_time")
    private LocalDateTime startTime; // When task was started

    @Column(name = "employee_id")
    private String employeeId; // Reference to the employee/user who owns this task
}

