package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.UploadHistoryDTO;

import java.util.List;

public interface UploadHistoryService {
    UploadHistoryDTO createUploadHistory(UploadHistoryDTO dto);
    UploadHistoryDTO getUploadHistoryById(Long id);
    List<UploadHistoryDTO> getAllUploadHistories();
    List<UploadHistoryDTO> getNewestUploads();
    UploadHistoryDTO updateUploadStatus(Long id, String uploadStatus, String remarks);
    void deleteUploadHistory(Long id);
}
