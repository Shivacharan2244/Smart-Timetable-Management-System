package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.UploadHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UploadHistoryRepository extends JpaRepository<UploadHistory, Long> {

    List<UploadHistory> findAllByOrderByUploadedAtDesc();

    List<UploadHistory> findByUploadedBy_IdOrderByUploadedAtDesc(Long userId);

    List<UploadHistory> findByUploadStatus(String uploadStatus);

    Optional<UploadHistory> findFirstByOrderByUploadedAtDesc();
}
