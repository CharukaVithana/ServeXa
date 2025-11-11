package com.servexa.appointment.scheduler;

import com.servexa.appointment.entity.Appointment;
import com.servexa.appointment.repository.AppointmentRepository;
import com.servexa.common.client.NotificationClient;
import com.servexa.common.client.NotificationClient.NotificationType;
import com.servexa.common.client.NotificationClient.NotificationPriority;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {
    
    private final AppointmentRepository appointmentRepository;
    private final NotificationClient notificationClient;
    
    // Run every hour to check for upcoming appointments
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void sendAppointmentReminders() {
        log.info("Running appointment reminder scheduler");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);
        
        // Find appointments scheduled for the next 24 hours
        List<Appointment> upcomingAppointments = appointmentRepository
                .findByBookingDateTimeBetweenAndStatusNot(now, tomorrow, "CANCELLED");
        
        for (Appointment appointment : upcomingAppointments) {
            try {
                // Check if we've already sent a reminder (you might want to track this in DB)
                if (shouldSendReminder(appointment)) {
                    sendReminder(appointment);
                }
            } catch (Exception e) {
                log.error("Failed to send reminder for appointment: {}", appointment.getId(), e);
            }
        }
        
        log.info("Completed sending {} appointment reminders", upcomingAppointments.size());
    }
    
    private boolean shouldSendReminder(Appointment appointment) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime appointmentTime = appointment.getBookingDateTime();
        
        // Send reminder if appointment is between 23-24 hours away
        long hoursUntilAppointment = java.time.Duration.between(now, appointmentTime).toHours();
        return hoursUntilAppointment >= 23 && hoursUntilAppointment <= 24;
    }
    
    private void sendReminder(Appointment appointment) {
        String title = "Appointment Reminder";
        String message = String.format(
            "Reminder: You have an appointment for %s tomorrow at %s. Don't forget to bring your vehicle registration.",
            appointment.getServiceType(),
            appointment.getBookingDateTime().format(DateTimeFormatter.ofPattern("hh:mm a"))
        );
        
        notificationClient.sendNotification(
            appointment.getCustomerId(),
            title,
            message,
            NotificationType.APPOINTMENT_REMINDER,
            NotificationPriority.HIGH,
            Map.of(
                "appointmentId", appointment.getId(),
                "serviceType", appointment.getServiceType(),
                "appointmentTime", appointment.getBookingDateTime().toString()
            )
        );
        
        log.info("Sent reminder for appointment: {}", appointment.getId());
    }
}