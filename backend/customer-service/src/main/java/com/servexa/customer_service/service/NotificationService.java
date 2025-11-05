package com.servexa.customerservice.service;

import com.servexa.customerservice.model.Notification;
import com.servexa.customerservice.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public List<Notification> getNotificationsByCustomer(Long customerId) {
        return repository.findByCustomerId(customerId);
    }

    public Notification addNotification(Notification notification) {
        return repository.save(notification);
    }

    public void markAsRead(Long id) {
        Notification notification = repository.findById(id).orElseThrow();
        notification.setRead(true);
        repository.save(notification);
    }

    public void deleteNotification(Long id) {
        repository.deleteById(id);
    }
}
