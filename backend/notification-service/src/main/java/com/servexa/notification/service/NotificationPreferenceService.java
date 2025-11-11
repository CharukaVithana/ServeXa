package com.servexa.notification.service;

import com.servexa.notification.dto.NotificationPreferenceRequest;
import com.servexa.notification.dto.NotificationPreferenceResponse;
import com.servexa.notification.model.NotificationPreference;
import com.servexa.notification.model.NotificationType;
import com.servexa.notification.repository.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationPreferenceService {
    
    private final NotificationPreferenceRepository preferenceRepository;
    
    public NotificationPreferenceResponse getPreferences(Long userId) {
        NotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreference(userId));
        
        return mapToResponse(preference);
    }
    
    public NotificationPreferenceResponse updatePreferences(Long userId, NotificationPreferenceRequest request) {
        NotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreference(userId));
        
        preference.setEmailEnabled(request.isEmailEnabled());
        preference.setPushEnabled(request.isPushEnabled());
        preference.setSmsEnabled(request.isSmsEnabled());
        
        if (request.getEnabledTypes() != null) {
            preference.setEnabledTypes(request.getEnabledTypes());
        }
        
        if (request.getQuietHoursStart() != null) {
            preference.setQuietHoursStart(request.getQuietHoursStart());
        }
        
        if (request.getQuietHoursEnd() != null) {
            preference.setQuietHoursEnd(request.getQuietHoursEnd());
        }
        
        preference = preferenceRepository.save(preference);
        log.info("Updated notification preferences for user: {}", userId);
        
        return mapToResponse(preference);
    }
    
    @Transactional(readOnly = true)
    public boolean shouldSendNotification(Long userId, NotificationType type) {
        NotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElse(null);
        
        if (preference == null) {
            return true; // Default to sending if no preference exists
        }
        
        return preference.getEnabledTypes().contains(type);
    }
    
    private NotificationPreference createDefaultPreference(Long userId) {
        NotificationPreference preference = NotificationPreference.builder()
                .userId(userId)
                .emailEnabled(true)
                .pushEnabled(true)
                .smsEnabled(false)
                .enabledTypes(Set.of(NotificationType.values()))
                .build();
        
        return preferenceRepository.save(preference);
    }
    
    private NotificationPreferenceResponse mapToResponse(NotificationPreference preference) {
        return NotificationPreferenceResponse.builder()
                .id(preference.getId())
                .userId(preference.getUserId())
                .emailEnabled(preference.isEmailEnabled())
                .pushEnabled(preference.isPushEnabled())
                .smsEnabled(preference.isSmsEnabled())
                .enabledTypes(preference.getEnabledTypes())
                .quietHoursStart(preference.getQuietHoursStart())
                .quietHoursEnd(preference.getQuietHoursEnd())
                .createdAt(preference.getCreatedAt())
                .updatedAt(preference.getUpdatedAt())
                .build();
    }
}