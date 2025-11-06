package com.servexa.auth.service;

import com.servexa.auth.entity.User;
import com.servexa.auth.repository.UserRepository;
import com.servexa.common.enums.UserStatus;
import com.servexa.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public List<User> getPendingUsers() {
        log.info("Fetching pending users");
        return userRepository.findByStatus(UserStatus.PENDING);
    }
    
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination");
        return userRepository.findAll(pageable);
    }
    
    @Transactional(readOnly = true)
    public List<User> getUsersByStatus(UserStatus status) {
        log.info("Fetching users with status: {}", status);
        return userRepository.findByStatus(status);
    }
    
    @Transactional
    public User updateUserStatus(String userId, UserStatus newStatus) {
        log.info("Updating user {} status to {}", userId, newStatus);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        UserStatus oldStatus = user.getStatus();
        user.setStatus(newStatus);
        
        User updatedUser = userRepository.save(user);
        log.info("User {} status updated from {} to {}", userId, oldStatus, newStatus);
        
        // TODO: Send notification email to user about status change
        
        return updatedUser;
    }
}