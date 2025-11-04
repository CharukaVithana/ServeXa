package com.servexa.employee.dto;

import com.servexa.employee.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatusUpdateRequest {
    
    @NotNull(message = "Status is required")
    private TaskStatus status;
    
    private Long duration; // Required when status is COMPLETED
}

