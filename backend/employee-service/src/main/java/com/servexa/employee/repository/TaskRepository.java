package com.servexa.employee.repository;

import com.servexa.employee.entity.Task;
import com.servexa.employee.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    
    List<Task> findAllByOrderByCreatedAtDesc();
    
    List<Task> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
    
    List<Task> findByStatusOrderByCreatedAtDesc(TaskStatus status);
    
    Optional<Task> findByIdAndEmployeeId(String id, String employeeId);
}

