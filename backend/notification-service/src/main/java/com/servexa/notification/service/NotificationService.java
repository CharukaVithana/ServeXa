package com.servexa.notification.service;

import com.servexa.notification.dto.*;
import com.servexa.notification.model.Notification;
import com.servexa.notification.model.NotificationStatus;
import com.servexa.notification.repository.NotificationRepository;
import com.servexa.notification.specification.NotificationSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    
    public NotificationResponse createNotification(NotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .status(NotificationStatus.UNREAD)
                .priority(request.getPriority())
                .metadata(request.getMetadata())
                .build();
        
        notification = notificationRepository.save(notification);
        log.info("Created notification with id: {} for user: {}", notification.getId(), notification.getUserId());
        
        return mapToResponse(notification);
    }
    
    public List<NotificationResponse> createBatchNotifications(BatchNotificationRequest request) {
        List<Notification> notifications = new ArrayList<>();
        
        for (String userId : request.getUserIds()) {
            Notification notification = Notification.builder()
                    .userId(userId)
                    .title(request.getNotification().getTitle())
                    .message(request.getNotification().getMessage())
                    .type(request.getNotification().getType())
                    .priority(request.getNotification().getPriority())
                    .status(NotificationStatus.UNREAD)
                    .metadata(request.getNotification().getMetadata())
                    .build();
            notifications.add(notification);
        }
        
        notifications = notificationRepository.saveAll(notifications);
        log.info("Created {} notifications in batch", notifications.size());
        
        return notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(NotificationFilterRequest filter) {
        Pageable pageable = PageRequest.of(
                filter.getPage(),
                filter.getSize(),
                Sort.by(Sort.Direction.fromString(filter.getSortDirection()), filter.getSortBy())
        );
        
        Page<Notification> notifications = notificationRepository.findAll(
                NotificationSpecification.withFilters(filter),
                pageable
        );
        
        return notifications.map(this::mapToResponse);
    }
    
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        
        return mapToResponse(notification);
    }
    
    public NotificationResponse markAsRead(Long id) {
        notificationRepository.markAsRead(id, NotificationStatus.READ, LocalDateTime.now());
        log.info("Marked notification {} as read", id);
        
        return getNotificationById(id);
    }
    
    public void markMultipleAsRead(List<Long> ids) {
        notificationRepository.updateStatusForIds(ids, NotificationStatus.READ);
        log.info("Marked {} notifications as read", ids.size());
    }
    
    public void deleteNotification(Long id) {
        notificationRepository.softDeleteByIds(
                List.of(id),
                NotificationStatus.DELETED,
                LocalDateTime.now()
        );
        log.info("Soft deleted notification: {}", id);
    }
    
    public void deleteMultipleNotifications(List<Long> ids) {
        notificationRepository.softDeleteByIds(
                ids,
                NotificationStatus.DELETED,
                LocalDateTime.now()
        );
        log.info("Soft deleted {} notifications", ids.size());
    }
    
    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndStatus(userId, NotificationStatus.UNREAD);
    }
    
    public void archiveOldNotifications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        List<Notification> oldNotifications = notificationRepository.findOldNotifications(
                cutoffDate,
                List.of(NotificationStatus.READ)
        );
        
        if (!oldNotifications.isEmpty()) {
            List<Long> ids = oldNotifications.stream()
                    .map(Notification::getId)
                    .collect(Collectors.toList());
            
            notificationRepository.updateStatusForIds(ids, NotificationStatus.ARCHIVED);
            log.info("Archived {} old notifications", ids.size());
        }
    }
    
    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .status(notification.getStatus())
                .priority(notification.getPriority())
                .metadata(notification.getMetadata())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}