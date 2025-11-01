package com.servexa.auth.controller;

import com.servexa.auth.entity.Appointment;
import com.servexa.auth.service.AppointmentService;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.http.HttpStatus;


@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    
private final AppointmentService appointmentService;

public AppointmentController(AppointmentService appointmentService){
    this.appointmentService= appointmentService;
}

//get all appointments(sorted by date & time)
@GetMapping
public List<Appointment> getAllAppointments(){
    return appointmentService.getAllAppointmentsStored();
}

//assign an employee to an appointment
// @PatchMapping("/{id}/assign")
// public ResponseEntity<?> assignEmployee(
//     @PathVariable Long id,
//     @RequestBody Map<String, String> request)
// {
//     String employeeName=request.get("employeeName");
//     if(employeeName==null || employeeName.isEmpty()){
//         return ResponseEntity.badRequest().body("Employee name is required");
//     }
//     Appointment updatedAppointment=appointmentService.assignEmployee(id, employeeName);
//     if(updatedAppointment==null){
//         return ResponseEntity.status(HttpStatus.NOT_FOUND)
//             .body("Appointment not found");
//     }
//     return ResponseEntity.ok(updatedAppointment);
// }

@PutMapping("/{appointmentId}/assign/{employeeId}")
public Appointment assignEmployee(
        @PathVariable Long appointmentId,
        @PathVariable Long employeeId
) {
    return appointmentService.assignEmployee(appointmentId, employeeId);
}


//create a new appointment ->only for testing

@PostMapping
public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
    appointment.setStatus(Appointment.Status.CREATED);
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(appointmentService.saveAppointment(appointment));
}


}




