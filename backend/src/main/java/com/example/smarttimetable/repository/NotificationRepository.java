package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser_IdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByUser_IdAndReadStatusFalseOrderByCreatedAtDesc(Long userId);

    long countByUser_IdAndReadStatusFalse(Long userId);

    List<Notification> findByTypeOrderByCreatedAtDesc(String type);

    List<Notification> findByStatus(String status);
}
