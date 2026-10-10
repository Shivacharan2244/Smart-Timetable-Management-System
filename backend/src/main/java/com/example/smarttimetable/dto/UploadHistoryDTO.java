package com.example.smarttimetable.dto;

import java.time.LocalDateTime;

public class UploadHistoryDTO {
    private Long uploadId;
    private String fileName;
    private String filePath;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
    private String uploadStatus;
    private String remarks;
    private String status;
    private Integer extractedCount = 0;
    private Integer conflictCount = 0;
    private Integer totalParsed = 0;

    public UploadHistoryDTO() {
    }

    public UploadHistoryDTO(Long uploadId, String fileName, String filePath,
                            Long uploadedById, String uploadedByName,
                            LocalDateTime uploadedAt, String uploadStatus,
                            String remarks, String status) {
        this(uploadId, fileName, filePath, uploadedById, uploadedByName, uploadedAt, uploadStatus, remarks, status, 0, 0, 0);
    }

    public UploadHistoryDTO(Long uploadId, String fileName, String filePath,
                            Long uploadedById, String uploadedByName,
                            LocalDateTime uploadedAt, String uploadStatus,
                            String remarks, String status,
                            Integer extractedCount, Integer conflictCount, Integer totalParsed) {
        this.uploadId = uploadId;
        this.fileName = fileName;
        this.filePath = filePath;
        this.uploadedById = uploadedById;
        this.uploadedByName = uploadedByName;
        this.uploadedAt = uploadedAt;
        this.uploadStatus = uploadStatus;
        this.remarks = remarks;
        this.status = status;
        this.extractedCount = extractedCount != null ? extractedCount : 0;
        this.conflictCount = conflictCount != null ? conflictCount : 0;
        this.totalParsed = totalParsed != null ? totalParsed : 0;
    }

    public Long getUploadId() {
        return uploadId;
    }

    public void setUploadId(Long uploadId) {
        this.uploadId = uploadId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getUploadedById() {
        return uploadedById;
    }

    public void setUploadedById(Long uploadedById) {
        this.uploadedById = uploadedById;
    }

    public String getUploadedByName() {
        return uploadedByName;
    }

    public void setUploadedByName(String uploadedByName) {
        this.uploadedByName = uploadedByName;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public String getUploadStatus() {
        return uploadStatus;
    }

    public void setUploadStatus(String uploadStatus) {
        this.uploadStatus = uploadStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getExtractedCount() {
        return extractedCount;
    }

    public void setExtractedCount(Integer extractedCount) {
        this.extractedCount = extractedCount;
    }

    public Integer getConflictCount() {
        return conflictCount;
    }

    public void setConflictCount(Integer conflictCount) {
        this.conflictCount = conflictCount;
    }

    public Integer getTotalParsed() {
        return totalParsed;
    }

    public void setTotalParsed(Integer totalParsed) {
        this.totalParsed = totalParsed;
    }
}
