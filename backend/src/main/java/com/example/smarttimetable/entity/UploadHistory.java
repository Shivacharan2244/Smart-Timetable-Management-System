package com.example.smarttimetable.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "upload_history")
public class UploadHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uploadId;

    @NotBlank(message = "File name is required")
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String fileName;

    @Size(max = 500)
    @Column(length = 500)
    private String filePath;

    @NotNull(message = "Uploader user reference is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;

    @Column(nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @NotBlank(message = "Upload status is required")
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String uploadStatus = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(nullable = false)
    private Integer extractedCount = 0;

    @Column(nullable = false)
    private Integer conflictCount = 0;

    @Column(nullable = false)
    private Integer totalParsed = 0;

    public UploadHistory() {
    }

    public UploadHistory(String fileName, String filePath, User uploadedBy, LocalDateTime uploadedAt,
                         String uploadStatus, String remarks, String status) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = uploadedAt != null ? uploadedAt : LocalDateTime.now();
        this.uploadStatus = uploadStatus != null ? uploadStatus : "PENDING";
        this.remarks = remarks;
        this.status = status != null ? status : "ACTIVE";
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

    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
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
