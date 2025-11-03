package com.servexa.customerservice.controller;

import com.servexa.customerservice.model.Customer;
import com.servexa.customerservice.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // GET /api/customers/profile?id=1
    @GetMapping("/profile")
    public ResponseEntity<Customer> getCustomerProfile(@RequestParam Long id) {
        Optional<Customer> customer = customerService.getCustomerById(id);
        return customer.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/customers/profile
    @PutMapping("/profile")
    public ResponseEntity<Customer> updateCustomerProfile(@RequestBody Customer updatedCustomer) {
        Customer saved = customerService.saveCustomer(updatedCustomer);
        return ResponseEntity.ok(saved);
    }

    // GET /api/customers
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    // DELETE /api/customers/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/customers
    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        Customer saved = customerService.saveCustomer(customer);
        return ResponseEntity.ok(saved);
    }
}
