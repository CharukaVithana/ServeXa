package com.servexa.employee.config;

import com.servexa.employee.entity.Task;
import com.servexa.employee.enums.TaskStatus;
import com.servexa.employee.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final TaskRepository taskRepository;

    @Override
    public void run(String... args) {
        if (taskRepository.count() == 0) {
            log.info("Initializing sample task data...");

            // Create sample pending tasks
            Task task1 = Task.builder()
                    .taskNumber("#SRV-2024-003")
                    .title("Transmission Service")
                    .description("Full transmission service and inspection")
                    .customerName("Robert Chen")
                    .vehicleModel("Ford F-150 2023")
                    .serviceType("Transmission Service")
                    .status(TaskStatus.ASSIGNED)
                    .estimatedDuration("120m")
                    .dueTime(LocalTime.of(15, 30)) // 3:30 PM
                    .isUrgent(false)
                    .employeeId("employee-1")
                    .build();

            Task task2 = Task.builder()
                    .taskNumber("#SRV-2024-004")
                    .title("Full Service")
                    .description("Complete vehicle service including oil change, filter replacement, and inspection")
                    .customerName("Emily Davis")
                    .vehicleModel("BMW 3 Series 2020")
                    .serviceType("Full Service")
                    .status(TaskStatus.ASSIGNED)
                    .estimatedDuration("90m")
                    .dueTime(LocalTime.of(16, 0)) // 4:00 PM
                    .isUrgent(true)
                    .employeeId("employee-1")
                    .build();

            Task task3 = Task.builder()
                    .taskNumber("#SRV-2024-005")
                    .title("Oil Change")
                    .description("Standard oil change service")
                    .customerName("John Anderson")
                    .vehicleModel("Toyota Camry 2020")
                    .serviceType("Oil Change")
                    .status(TaskStatus.ONGOING)
                    .estimatedDuration("45m")
                    .dueTime(LocalTime.of(11, 30)) // 11:30 AM
                    .isUrgent(false)
                    .employeeId("employee-1")
                    .build();

            Task task4 = Task.builder()
                    .taskNumber("#SRV-2024-006")
                    .title("Battery Check & Software Update")
                    .description("Battery health check and software update")
                    .customerName("Michael Brown")
                    .vehicleModel("Tesla Model 3 2023")
                    .serviceType("Battery Check & Software Update")
                    .status(TaskStatus.COMPLETED)
                    .estimatedDuration("90m")
                    .duration(90L)
                    .isUrgent(false)
                    .employeeId("employee-1")
                    .build();

            taskRepository.save(task1);
            taskRepository.save(task2);
            taskRepository.save(task3);
            taskRepository.save(task4);

            log.info("Sample task data initialized successfully");
        } else {
            log.info("Task data already exists, skipping initialization");
        }
    }
}

