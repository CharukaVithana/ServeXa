package com.servexa.employee.dto;

import com.servexa.employee.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private String id;
    private String taskNumber;
    private String title;
    private String description;
    private String customerName;
    private String vehicleModel;
    private String serviceType;
    private TaskStatus status;
    private Long duration;
    private String estimatedDuration;
    private LocalTime dueTime;
    private Boolean isUrgent;
    private LocalDateTime completionTime;
    private LocalDateTime startTime;
    private String employeeId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

