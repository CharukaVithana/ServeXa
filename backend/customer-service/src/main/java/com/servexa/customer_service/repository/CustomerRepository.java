package com.servexa.customerservice.repository;

import com.servexa.customerservice.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // You can add custom queries later, for example:
    // Optional<Customer> findByEmail(String email);
}
