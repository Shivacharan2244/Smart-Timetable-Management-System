package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {
    NotificationDTO createNotification(NotificationDTO dto);
    NotificationDTO getNotificationById(Long id);
    List<NotificationDTO> getAllNotifications();
    List<NotificationDTO> getNotificationsByUser(Long userId);
    List<NotificationDTO> getUnreadNotificationsByUser(Long userId);
    long countUnreadNotifications(Long userId);
    NotificationDTO markAsRead(Long id);
    void markAllAsRead(Long userId);
    void deleteNotification(Long id);

    // System event notification generator helper
    void sendSystemNotification(Long userId, String title, String message, String type);
}
