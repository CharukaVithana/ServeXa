package com.servexa.auth.service;

import com.servexa.auth.entity.User;
import com.servexa.auth.repository.UserRepository;
import com.servexa.auth.util.TestDataBuilder;
import com.servexa.common.enums.UserRole;
import com.servexa.common.enums.UserStatus;
import com.servexa.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService Unit Tests")
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminService adminService;

    private User pendingUser;
    private User approvedUser;
    private User rejectedUser;
    private List<User> allUsers;

    @BeforeEach
    void setUp() {
        pendingUser = TestDataBuilder.createUser("pending@example.com", UserRole.EMPLOYEE, UserStatus.PENDING);
        approvedUser = TestDataBuilder.createUser("approved@example.com", UserRole.CUSTOMER, UserStatus.APPROVED);
        rejectedUser = TestDataBuilder.createUser("rejected@example.com", UserRole.ADMIN, UserStatus.REJECTED);
        allUsers = Arrays.asList(pendingUser, approvedUser, rejectedUser);
    }

    @Test
    @DisplayName("Should get pending users")
    void getPendingUsers_ShouldReturnPendingUsersList() {
        // Given
        List<User> pendingUsers = Arrays.asList(pendingUser);
        when(userRepository.findByStatus(UserStatus.PENDING)).thenReturn(pendingUsers);

        // When
        List<User> result = adminService.getPendingUsers();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(UserStatus.PENDING);
        verify(userRepository).findByStatus(UserStatus.PENDING);
    }

    @Test
    @DisplayName("Should get empty list when no pending users")
    void getPendingUsers_WhenNoPendingUsers_ShouldReturnEmptyList() {
        // Given
        when(userRepository.findByStatus(UserStatus.PENDING)).thenReturn(Arrays.asList());

        // When
        List<User> result = adminService.getPendingUsers();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(userRepository).findByStatus(UserStatus.PENDING);
    }

    @Test
    @DisplayName("Should get all users with pagination")
    void getAllUsers_ShouldReturnPagedUsers() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> userPage = new PageImpl<>(allUsers, pageable, allUsers.size());
        when(userRepository.findAll(pageable)).thenReturn(userPage);

        // When
        Page<User> result = adminService.getAllUsers(pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(3);
        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent()).containsExactlyInAnyOrder(pendingUser, approvedUser, rejectedUser);
        verify(userRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should get users by specific status")
    void getUsersByStatus_ShouldReturnUsersWithMatchingStatus() {
        // Given
        List<User> approvedUsers = Arrays.asList(approvedUser);
        when(userRepository.findByStatus(UserStatus.APPROVED)).thenReturn(approvedUsers);

        // When
        List<User> result = adminService.getUsersByStatus(UserStatus.APPROVED);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(UserStatus.APPROVED);
        verify(userRepository).findByStatus(UserStatus.APPROVED);
    }

    @Test
    @DisplayName("Should update user status successfully")
    void updateUserStatus_WithValidUserId_ShouldUpdateStatus() {
        // Given
        String userId = pendingUser.getId();
        UserStatus newStatus = UserStatus.APPROVED;
        when(userRepository.findById(userId)).thenReturn(Optional.of(pendingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        User result = adminService.updateUserStatus(userId, newStatus);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(newStatus);
        verify(userRepository).findById(userId);
        verify(userRepository).save(argThat(user -> user.getStatus() == newStatus));
    }

    @Test
    @DisplayName("Should throw exception when user not found for status update")
    void updateUserStatus_WithInvalidUserId_ShouldThrowResourceNotFoundException() {
        // Given
        String userId = UUID.randomUUID().toString();
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> adminService.updateUserStatus(userId, UserStatus.APPROVED))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found with id: " + userId);

        verify(userRepository).findById(userId);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should update user status from rejected to approved")
    void updateUserStatus_FromRejectedToApproved_ShouldUpdateSuccessfully() {
        // Given
        String userId = rejectedUser.getId();
        UserStatus newStatus = UserStatus.APPROVED;
        when(userRepository.findById(userId)).thenReturn(Optional.of(rejectedUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        User result = adminService.updateUserStatus(userId, newStatus);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(newStatus);
        verify(userRepository).save(argThat(user -> 
            user.getId().equals(rejectedUser.getId()) && 
            user.getStatus() == UserStatus.APPROVED
        ));
    }

    @Test
    @DisplayName("Should handle multiple status transitions")
    void updateUserStatus_MultipleTransitions_ShouldAllSucceed() {
        // Test PENDING -> APPROVED
        String userId = pendingUser.getId();
        when(userRepository.findById(userId)).thenReturn(Optional.of(pendingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        
        User result1 = adminService.updateUserStatus(userId, UserStatus.APPROVED);
        assertThat(result1.getStatus()).isEqualTo(UserStatus.APPROVED);

        // Test APPROVED -> SUSPENDED
        when(userRepository.findById(userId)).thenReturn(Optional.of(result1));
        User result2 = adminService.updateUserStatus(userId, UserStatus.SUSPENDED);
        assertThat(result2.getStatus()).isEqualTo(UserStatus.SUSPENDED);

        verify(userRepository, times(2)).findById(userId);
        verify(userRepository, times(2)).save(any(User.class));
    }
}