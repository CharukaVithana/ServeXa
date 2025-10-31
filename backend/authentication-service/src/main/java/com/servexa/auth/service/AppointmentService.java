package com.servexa.auth.service;

import com.servexa.auth.entity.Appointment;
import com.servexa.auth.entity.Employee;

import org.springframework.stereotype.Service;
import com.servexa.auth.repository.AppointmentRepository;
import com.servexa.auth.repository.EmployeeRepository;

import java.util.List;
import java.util.Optional;


@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
        private final EmployeeRepository employeeRepository;


    public AppointmentService(AppointmentRepository appointmentRepository,EmployeeRepository employeeRepository){
        this.appointmentRepository=appointmentRepository;
                this.employeeRepository = employeeRepository;

    }

    //get all appointments sorted by date & time        
    public List<Appointment> getAllAppointmentsStored(){
        return appointmentRepository.findAllByOrderByAppointmentDateTimeAsc();
    }

    //get appointment by id
    public Appointment getAppointmentById(Long id){
        return appointmentRepository.findById(id).orElse(null);
    }

        // assign employee to appointment
    public Appointment assignEmployee(Long appointmentId, Long employeeId) {
        Optional<Appointment> optionalAppointment = appointmentRepository.findById(appointmentId);
        Optional<Employee> optionalEmployee = employeeRepository.findById(employeeId);

        if (optionalAppointment.isPresent() && optionalEmployee.isPresent()) {
            Appointment appointment = optionalAppointment.get();
            Employee employee = optionalEmployee.get();

            appointment.setAssignedEmployee(employee);
            appointment.setStatus(Appointment.Status.ASSIGNED);

            return appointmentRepository.save(appointment);
        }

        return null;
    }

    //save appointment
    public Appointment saveAppointment(Appointment appointment) {
    return appointmentRepository.save(appointment);
}

    
    
}
