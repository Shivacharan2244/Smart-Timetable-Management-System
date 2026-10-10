package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.NotificationDTO;
import com.example.smarttimetable.entity.Notification;
import com.example.smarttimetable.entity.User;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.NotificationRepository;
import com.example.smarttimetable.repository.UserRepository;
import com.example.smarttimetable.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public NotificationDTO createNotification(NotificationDTO dto) {
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new BusinessException("Notification title cannot be empty.");
        }
        if (dto.getMessage() == null || dto.getMessage().trim().isEmpty()) {
            throw new BusinessException("Notification message cannot be empty.");
        }
        if (dto.getUserId() == null) {
            throw new BusinessException("Target user ID is required.");
        }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + dto.getUserId()));

        Notification notification = new Notification();
        notification.setTitle(dto.getTitle().trim());
        notification.setMessage(dto.getMessage().trim());
        notification.setType(dto.getType() != null ? dto.getType().trim().toUpperCase() : "INFO");
        notification.setUser(user);
        notification.setReadStatus(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setStatus("ACTIVE");

        Notification saved = notificationRepository.save(notification);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationDTO getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        return mapToDTO(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getAllNotifications() {
        return notificationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotificationsByUser(Long userId) {
        return notificationRepository.findByUser_IdAndReadStatusFalseOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnreadNotifications(Long userId) {
        return notificationRepository.countByUser_IdAndReadStatusFalse(userId);
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        notification.setReadStatus(true);
        Notification updated = notificationRepository.save(notification);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadList = notificationRepository.findByUser_IdAndReadStatusFalseOrderByCreatedAtDesc(userId);
        for (Notification n : unreadList) {
            n.setReadStatus(true);
        }
        notificationRepository.saveAll(unreadList);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Notification not found with ID: " + id);
        }
        notificationRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void sendSystemNotification(Long userId, String title, String message, String type) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            Notification notification = new Notification(
                    title,
                    message,
                    type != null ? type : "INFO",
                    user,
                    false,
                    LocalDateTime.now(),
                    "ACTIVE"
            );
            notificationRepository.save(notification);
        }
    }

    private NotificationDTO mapToDTO(Notification n) {
        return new NotificationDTO(
                n.getNotificationId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getUser() != null ? n.getUser().getId() : null,
                n.getUser() != null ? n.getUser().getName() : null,
                n.getReadStatus(),
                n.getCreatedAt(),
                n.getStatus()
        );
    }
}
