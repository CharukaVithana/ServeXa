package com.servexa.auth.config;

import com.servexa.auth.entity.User;
import com.servexa.auth.repository.UserRepository;
import com.servexa.common.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    @Bean
    CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if any users exist
            if (userRepository.count() == 0) {
                // Create a test user
                User testUser = User.builder()
                        .email("test@example.com")
                        .password(passwordEncoder.encode("Test@123"))
                        .fullName("Test User")
                        .role(UserRole.CUSTOMER)
                        .isEmailVerified(true)
                        .build();
                
                userRepository.save(testUser);
                log.info("Test user created: test@example.com / Test@123");
            }
            
            log.info("Total users in database: {}", userRepository.count());
        };
    }
}