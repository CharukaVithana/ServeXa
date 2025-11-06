package com.servexa.auth.repository;

import com.servexa.auth.entity.User;
import com.servexa.common.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByRefreshToken(String refreshToken);
    
    List<User> findByStatus(UserStatus status);
    
    List<User> findByStatusOrderByCreatedAtDesc(UserStatus status);
}