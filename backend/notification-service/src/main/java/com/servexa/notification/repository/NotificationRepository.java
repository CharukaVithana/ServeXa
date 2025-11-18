package com.servexa.notification.repository;

import com.servexa.notification.model.Notification;
import com.servexa.notification.model.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {
    
    Page<Notification> findByUserId(String userId, Pageable pageable);
    
    Page<Notification> findByUserIdAndStatus(String userId, NotificationStatus status, Pageable pageable);
    
    List<Notification> findByUserIdAndStatusIn(String userId, List<NotificationStatus> statuses);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.status = :status")
    long countByUserIdAndStatus(@Param("userId") String userId, @Param("status") NotificationStatus status);
    
    @Modifying
    @Query("UPDATE Notification n SET n.status = :status WHERE n.id IN :ids")
    void updateStatusForIds(@Param("ids") List<Long> ids, @Param("status") NotificationStatus status);
    
    @Modifying
    @Query("UPDATE Notification n SET n.status = :status, n.readAt = :readAt WHERE n.id = :id")
    void markAsRead(@Param("id") Long id, @Param("status") NotificationStatus status, @Param("readAt") LocalDateTime readAt);
    
    @Modifying
    @Query("UPDATE Notification n SET n.status = :status, n.deletedAt = :deletedAt WHERE n.id IN :ids")
    void softDeleteByIds(@Param("ids") List<Long> ids, @Param("status") NotificationStatus status, @Param("deletedAt") LocalDateTime deletedAt);
    
    @Query("SELECT n FROM Notification n WHERE n.createdAt < :date AND n.status IN :statuses")
    List<Notification> findOldNotifications(@Param("date") LocalDateTime date, @Param("statuses") List<NotificationStatus> statuses);
}