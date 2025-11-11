package com.servexa.notification.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "notification_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private Long userId;
    
    @Column(name = "email_enabled")
    private boolean emailEnabled = true;
    
    @Column(name = "push_enabled")
    private boolean pushEnabled = true;
    
    @Column(name = "sms_enabled")
    private boolean smsEnabled = false;
    
    @ElementCollection
    @CollectionTable(
        name = "notification_type_preferences",
        joinColumns = @JoinColumn(name = "preference_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type")
    private Set<NotificationType> enabledTypes = new HashSet<>();
    
    @Column(name = "quiet_hours_start")
    private String quietHoursStart;
    
    @Column(name = "quiet_hours_end")
    private String quietHoursEnd;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Enable all notification types by default
        if (enabledTypes.isEmpty()) {
            enabledTypes.addAll(Set.of(NotificationType.values()));
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}