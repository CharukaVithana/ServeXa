package com.servexa.auth.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;  
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity 
@Table(name="appointments")

public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String serviceType;
    private LocalDateTime appointmentDateTime;
    private String vehicleType;
    private String customerName;
    private String customerContact;

    @Enumerated(EnumType.STRING)
    private Status status=Status.CREATED;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee assignedEmployee;


    public enum Status{
        CREATED,
        ASSIGNED
    }

    //Getters and setters
    public Long getId(){
        return id;
    }
    public void setId(Long id){
        this.id=id;
    }

    public String getServiceType(){
        return serviceType;
    }
    public void setServiceType(String serviceType){
        this.serviceType=serviceType;

    }

    public LocalDateTime getAppointmentDateTime(){
        return appointmentDateTime;
    }
    public void setAppointmentDateTime(LocalDateTime appointmentDateTime){
        this.appointmentDateTime=appointmentDateTime;
    }

    public String getVehicleType(){
        return vehicleType;
    }
    public void setVehicleType(String vehicleType){
        this.vehicleType=vehicleType;
    }

    public String getCustomerName(){
        return customerName;
    }
    public void setCustomerName(String customerName){
        this.customerName=customerName;
    }

    public String getCustomerContact(){
        return customerContact;
    }
    public void setCustomerContact(String customerContact){
        this.customerContact = customerContact; 
    }

    public Status getStatus(){
        return status;
    }
    public void setStatus(Status status){
        this.status=status;
    }

     public Employee getAssignedEmployee() {
        return assignedEmployee;
    }
    public void setAssignedEmployee(Employee assignedEmployee) {
        this.assignedEmployee = assignedEmployee;
    }

}
