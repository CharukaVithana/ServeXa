package com.servexa.employee.service;

import com.servexa.common.exception.BadRequestException;
import com.servexa.common.exception.ResourceNotFoundException;
import com.servexa.employee.dto.TaskResponse;
import com.servexa.employee.dto.TaskStatusUpdateRequest;
import com.servexa.employee.entity.Task;
import com.servexa.employee.enums.TaskStatus;
import com.servexa.employee.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;

    /**
     * Get all tasks
     */
    public List<TaskResponse> getAllTasks() {
        log.info("Fetching all tasks");
        List<Task> tasks = taskRepository.findAllByOrderByCreatedAtDesc();
        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get pending tasks (ASSIGNED status)
     */
    public List<TaskResponse> getPendingTasks() {
        log.info("Fetching pending tasks");
        List<Task> tasks = taskRepository.findByStatusOrderByCreatedAtDesc(TaskStatus.ASSIGNED);
        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get ongoing tasks (ONGOING status)
     */
    public List<TaskResponse> getOngoingTasks() {
        log.info("Fetching ongoing tasks");
        List<Task> tasks = taskRepository.findByStatusOrderByCreatedAtDesc(TaskStatus.ONGOING);
        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get completed tasks (COMPLETED status)
     */
    public List<TaskResponse> getCompletedTasks() {
        log.info("Fetching completed tasks");
        List<Task> tasks = taskRepository.findByStatusOrderByCreatedAtDesc(TaskStatus.COMPLETED);
        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Start a task (change status from ASSIGNED to ONGOING)
     */
    @Transactional
    public TaskResponse startTask(String taskId) {
        log.info("Starting task {}", taskId);
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if (task.getStatus() != TaskStatus.ASSIGNED) {
            throw new BadRequestException("Only ASSIGNED tasks can be started");
        }

        task.setStatus(TaskStatus.ONGOING);
        task.setStartTime(LocalDateTime.now());

        Task updatedTask = taskRepository.save(task);
        log.info("Task {} started successfully", taskId);
        
        return mapToResponse(updatedTask);
    }

    /**
     * Update task status
     */
    @Transactional
    public TaskResponse updateTaskStatus(String taskId, TaskStatusUpdateRequest request) {
        log.info("Updating task {} status to {}", taskId, request.getStatus());
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        // Store original status before updating
        TaskStatus originalStatus = task.getStatus();

        // Validate status transition
        validateStatusTransition(originalStatus, request.getStatus());

        // Update status
        task.setStatus(request.getStatus());

        // If status is COMPLETED, update completion time and duration
        if (request.getStatus() == TaskStatus.COMPLETED) {
            if (request.getDuration() == null || request.getDuration() <= 0) {
                throw new BadRequestException("Duration is required when marking task as COMPLETED");
            }
            task.setCompletionTime(LocalDateTime.now());
            task.setDuration(request.getDuration());
        } else if (request.getStatus() == TaskStatus.ONGOING) {
            // Set start time if not already set
            if (task.getStartTime() == null) {
                task.setStartTime(LocalDateTime.now());
            }
            // Clear completion time if status changes from COMPLETED to ONGOING
            if (originalStatus == TaskStatus.COMPLETED) {
                task.setCompletionTime(null);
                task.setDuration(null);
            }
        }

        Task updatedTask = taskRepository.save(task);
        log.info("Task {} status updated successfully to {}", taskId, request.getStatus());
        
        return mapToResponse(updatedTask);
    }

    /**
     * Validate status transition
     */
    private void validateStatusTransition(TaskStatus currentStatus, TaskStatus newStatus) {
        if (currentStatus == newStatus) {
            return; // Same status is allowed
        }

        // Define valid transitions
        switch (currentStatus) {
            case ASSIGNED:
                if (newStatus != TaskStatus.ONGOING && newStatus != TaskStatus.COMPLETED) {
                    throw new BadRequestException("Invalid status transition from ASSIGNED to " + newStatus);
                }
                break;
            case ONGOING:
                if (newStatus != TaskStatus.COMPLETED && newStatus != TaskStatus.ASSIGNED) {
                    throw new BadRequestException("Invalid status transition from ONGOING to " + newStatus);
                }
                break;
            case COMPLETED:
                // Allow re-opening completed tasks
                if (newStatus != TaskStatus.ONGOING && newStatus != TaskStatus.ASSIGNED) {
                    throw new BadRequestException("Invalid status transition from COMPLETED to " + newStatus);
                }
                break;
        }
    }

    /**
     * Get tasks by employee ID
     */
    public List<TaskResponse> getTasksByEmployeeId(String employeeId) {
        log.info("Fetching tasks for employee: {}", employeeId);
        List<Task> tasks = taskRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get tasks by employee ID and status
     */
    public List<TaskResponse> getTasksByEmployeeIdAndStatus(String employeeId, TaskStatus status) {
        log.info("Fetching tasks for employee: {} with status: {}", employeeId, status);
        List<Task> tasks = taskRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
        return tasks.stream()
                .filter(task -> task.getStatus() == status)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get task by ID
     */
    public TaskResponse getTaskById(String taskId) {
        log.info("Fetching task with id: {}", taskId);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        return mapToResponse(task);
    }

    /**
     * Map Task entity to TaskResponse DTO
     */
    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .taskNumber(task.getTaskNumber())
                .title(task.getTitle())
                .description(task.getDescription())
                .customerName(task.getCustomerName())
                .vehicleModel(task.getVehicleModel())
                .serviceType(task.getServiceType())
                .status(task.getStatus())
                .duration(task.getDuration())
                .estimatedDuration(task.getEstimatedDuration())
                .dueTime(task.getDueTime())
                .isUrgent(task.getIsUrgent())
                .completionTime(task.getCompletionTime())
                .startTime(task.getStartTime())
                .employeeId(task.getEmployeeId())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}

