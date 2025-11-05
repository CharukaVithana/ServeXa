package com.servexa.employee.controller;

import com.servexa.common.dto.ApiResponse;
import com.servexa.employee.dto.TaskResponse;
import com.servexa.employee.dto.TaskStatusUpdateRequest;
import com.servexa.employee.enums.TaskStatus;
import com.servexa.employee.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management APIs")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "Get all tasks", description = "Fetch all tasks stored in the system")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getAllTasks() {
        List<TaskResponse> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(
                ApiResponse.success(tasks, "Tasks retrieved successfully")
        );
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending tasks", description = "Fetch all tasks with ASSIGNED status")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getPendingTasks() {
        List<TaskResponse> tasks = taskService.getPendingTasks();
        return ResponseEntity.ok(
                ApiResponse.success(tasks, "Pending tasks retrieved successfully")
        );
    }

    @GetMapping("/ongoing")
    @Operation(summary = "Get ongoing tasks", description = "Fetch all tasks with ONGOING status")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getOngoingTasks() {
        List<TaskResponse> tasks = taskService.getOngoingTasks();
        return ResponseEntity.ok(
                ApiResponse.success(tasks, "Ongoing tasks retrieved successfully")
        );
    }

    @GetMapping("/completed")
    @Operation(summary = "Get completed tasks", description = "Fetch all tasks with COMPLETED status")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getCompletedTasks() {
        List<TaskResponse> tasks = taskService.getCompletedTasks();
        return ResponseEntity.ok(
                ApiResponse.success(tasks, "Completed tasks retrieved successfully")
        );
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start a task", description = "Change task status from ASSIGNED to ONGOING")
    public ResponseEntity<ApiResponse<TaskResponse>> startTask(@PathVariable String id) {
        TaskResponse updatedTask = taskService.startTask(id);
        return ResponseEntity.ok(
                ApiResponse.success(updatedTask, "Task started successfully")
        );
    }

    @PutMapping("/{id}/status")
    @Operation(
            summary = "Update task status",
            description = "Update the status of a task. When status is ONGOING, only status is updated. " +
                    "When status is COMPLETED, both status and duration must be provided."
    )
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable String id,
            @Valid @RequestBody TaskStatusUpdateRequest request) {
        TaskResponse updatedTask = taskService.updateTaskStatus(id, request);
        return ResponseEntity.ok(
                ApiResponse.success(updatedTask, "Task status updated successfully")
        );
    }

    @GetMapping("/my-tasks")
    @Operation(summary = "Get current employee's tasks", description = "Fetch all tasks assigned to the authenticated employee")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyTasks(
            @RequestAttribute("userId") String employeeId) {
        List<TaskResponse> tasks = taskService.getTasksByEmployeeId(employeeId);
        return ResponseEntity.ok(
                ApiResponse.success(tasks, "Your tasks retrieved successfully")
        );
    }

    @GetMapping("/my-tasks/{status}")
    @Operation(summary = "Get current employee's tasks by status", description = "Fetch tasks with specific status for the authenticated employee")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyTasksByStatus(
            @PathVariable TaskStatus status,
            @RequestAttribute("userId") String employeeId) {
        List<TaskResponse> tasks = taskService.getTasksByEmployeeIdAndStatus(employeeId, status);
        return ResponseEntity.ok(
                ApiResponse.success(tasks, "Your tasks retrieved successfully")
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID", description = "Fetch a specific task by its ID")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable String id) {
        TaskResponse task = taskService.getTaskById(id);
        return ResponseEntity.ok(
                ApiResponse.success(task, "Task retrieved successfully")
        );
    }
}

