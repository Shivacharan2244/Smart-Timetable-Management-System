package com.example.smarttimetable.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class NotificationDTO {
    private Long notificationId;

    @NotBlank(message = "Notification title is required.")
    private String title;

    @NotBlank(message = "Notification message is required.")
    private String message;

    private String type;

    @NotNull(message = "User ID is required.")
    private Long userId;

    private String userName;
    private Boolean readStatus;
    private LocalDateTime createdAt;
    private String status;

    public NotificationDTO() {
    }

    public NotificationDTO(Long notificationId, String title, String message, String type,
                           Long userId, String userName, Boolean readStatus,
                           LocalDateTime createdAt, String status) {
        this.notificationId = notificationId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.userId = userId;
        this.userName = userName;
        this.readStatus = readStatus;
        this.createdAt = createdAt;
        this.status = status;
    }

    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Boolean getReadStatus() {
        return readStatus;
    }

    public void setReadStatus(Boolean readStatus) {
        this.readStatus = readStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
