package com.servexa.customerservice.controller;

import com.servexa.customerservice.model.Notification;
import com.servexa.customerservice.service.NotificationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers/{customerId}/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notification> getNotifications(@PathVariable Long customerId) {
        return service.getNotificationsByCustomer(customerId);
    }

    @PostMapping
    public Notification addNotification(@PathVariable Long customerId, @RequestBody Notification notification) {
        notification.setCustomerId(customerId);
        return service.addNotification(notification);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
    }

    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        service.deleteNotification(id);
    }
}
