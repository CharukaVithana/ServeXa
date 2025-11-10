package com.servexa.auth;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateBCryptHashTest {
    
    @Test
    public void generateAdminPasswordHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "admin";
        String hashedPassword = encoder.encode(password);
        
        System.out.println("\n=== BCrypt Hash Generation ===");
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hashedPassword);
        System.out.println("\n=== Docker Command ===");
        System.out.println("docker exec -it servexa-postgres psql -U postgres -d servexa_auth -c \"INSERT INTO users (id, email, password, full_name, role, status, is_email_verified, is_active, created_at, updated_at) VALUES (gen_random_uuid(), 'admin123@gmail.com', '" + hashedPassword + "', 'Admin', 'ADMIN', 'APPROVED', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);\"");
        
        // Also verify the hash we were using
        System.out.println("\n=== Verification ===");
        String oldHash = "$2a$10$7PtcjEnWb/ZkgyXtSY9qFeldJn2NnmisNTE3JlYn2QKtWPvNDg2g2";
        boolean matches = encoder.matches(password, oldHash);
        System.out.println("Does 'admin' match the old hash? " + matches);
    }
}