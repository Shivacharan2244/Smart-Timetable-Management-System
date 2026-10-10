package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.UploadHistoryDTO;
import com.example.smarttimetable.entity.UploadHistory;
import com.example.smarttimetable.entity.User;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.UploadHistoryRepository;
import com.example.smarttimetable.repository.UserRepository;
import com.example.smarttimetable.service.UploadHistoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import com.example.smarttimetable.repository.TimetableEntryRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UploadHistoryServiceImpl implements UploadHistoryService {

    private final UploadHistoryRepository uploadHistoryRepository;
    private final UserRepository userRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    public UploadHistoryServiceImpl(UploadHistoryRepository uploadHistoryRepository,
                                    UserRepository userRepository,
                                    TimetableEntryRepository timetableEntryRepository) {
        this.uploadHistoryRepository = uploadHistoryRepository;
        this.userRepository = userRepository;
        this.timetableEntryRepository = timetableEntryRepository;
    }

    @Override
    @Transactional
    public UploadHistoryDTO createUploadHistory(UploadHistoryDTO dto) {
        if (dto.getFileName() == null || dto.getFileName().trim().isEmpty()) {
            throw new BusinessException("File name is required.");
        }
        if (dto.getUploadedById() == null) {
            throw new BusinessException("Uploader user ID is required.");
        }

        User uploader = userRepository.findById(dto.getUploadedById())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + dto.getUploadedById()));

        UploadHistory history = new UploadHistory();
        history.setFileName(dto.getFileName().trim());
        history.setFilePath(dto.getFilePath());
        history.setUploadedBy(uploader);
        history.setUploadedAt(dto.getUploadedAt() != null ? dto.getUploadedAt() : LocalDateTime.now());
        history.setUploadStatus(dto.getUploadStatus() != null ? dto.getUploadStatus() : "PENDING");
        history.setRemarks(dto.getRemarks());
        history.setStatus("ACTIVE");

        UploadHistory saved = uploadHistoryRepository.save(history);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UploadHistoryDTO getUploadHistoryById(Long id) {
        UploadHistory history = uploadHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Upload history not found with ID: " + id));
        return mapToDTO(history);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UploadHistoryDTO> getAllUploadHistories() {
        return uploadHistoryRepository.findAllByOrderByUploadedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UploadHistoryDTO> getNewestUploads() {
        return uploadHistoryRepository.findAllByOrderByUploadedAtDesc().stream()
                .limit(10)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UploadHistoryDTO updateUploadStatus(Long id, String uploadStatus, String remarks) {
        UploadHistory history = uploadHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Upload history not found with ID: " + id));

        history.setUploadStatus(uploadStatus);
        if (remarks != null) {
            history.setRemarks(remarks);
        }

        UploadHistory updated = uploadHistoryRepository.save(history);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteUploadHistory(Long id) {
        if (!uploadHistoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Upload history not found with ID: " + id);
        }
        // Safely cascade delete associated timetable entries first
        timetableEntryRepository.deleteByUploadHistory_UploadId(id);
        uploadHistoryRepository.deleteById(id);
    }

    private UploadHistoryDTO mapToDTO(UploadHistory h) {
        return new UploadHistoryDTO(
                h.getUploadId(),
                h.getFileName(),
                h.getFilePath(),
                h.getUploadedBy() != null ? h.getUploadedBy().getId() : null,
                h.getUploadedBy() != null ? h.getUploadedBy().getName() : null,
                h.getUploadedAt(),
                h.getUploadStatus(),
                h.getRemarks(),
                h.getStatus(),
                h.getExtractedCount() != null ? h.getExtractedCount() : 0,
                h.getConflictCount() != null ? h.getConflictCount() : 0,
                h.getTotalParsed() != null ? h.getTotalParsed() : 0
        );
    }
}
