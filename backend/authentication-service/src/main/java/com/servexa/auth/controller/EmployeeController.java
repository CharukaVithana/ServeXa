package com.servexa.auth.controller;

import com.servexa.auth.entity.Employee;
import com.servexa.auth.service.EmployeeService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // Get all employees
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    // Add multiple employees
    @PostMapping
    public ResponseEntity<List<Employee>> addEmployees(@RequestBody List<Employee> employees) {
        List<Employee> savedEmployees = employeeService.saveAllEmployees(employees);
        return new ResponseEntity<>(savedEmployees, HttpStatus.CREATED);
    }
}
