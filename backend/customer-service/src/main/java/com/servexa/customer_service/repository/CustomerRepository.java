package com.servexa.customerservice.repository;

import com.servexa.customerservice.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // Find customer by email (used to map authenticated user to customer record)
    java.util.Optional<Customer> findByEmail(String email);
}
