package com.servexa.auth.controller;

import com.servexa.auth.dto.UserStatusUpdateRequest;
import com.servexa.auth.entity.User;
import com.servexa.auth.service.AdminService;
import com.servexa.common.dto.ApiResponse;
import com.servexa.common.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<User>>> getPendingUsers() {
        List<User> pendingUsers = adminService.getPendingUsers();
        return ResponseEntity.ok(ApiResponse.success(pendingUsers, "Pending users retrieved successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(Pageable pageable) {
        Page<User> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }

    @PutMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable String userId,
            @RequestBody UserStatusUpdateRequest request) {
        User updatedUser = adminService.updateUserStatus(userId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "User status updated successfully"));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByStatus(@PathVariable UserStatus status) {
        List<User> users = adminService.getUsersByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(users, "Users retrieved successfully"));
    }
}