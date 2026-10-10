package com.example.smarttimetable.dto;

import java.util.ArrayList;
import java.util.List;

public class PdfUploadResponseDTO {
    private Long uploadId;
    private String fileName;
    private String uploadStatus;
    private int extractedCount;
    private int conflictCount;
    private int totalParsed;
    private List<String> conflicts = new ArrayList<>();
    private List<String> errors = new ArrayList<>();
    private List<TimetableEntryDTO> savedEntries = new ArrayList<>();
    private String message;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private List<String> sectionsInvolved = new ArrayList<>();
    private Integer yearOfStudy; // 1, 2, 3, 4
    private String yearName;     // "1st Year", "2nd Year", "3rd Year", "4th Year"
    private Integer semesterNumber;
    private String semesterName;
    private String academicYear;

    public PdfUploadResponseDTO() {
    }

    public PdfUploadResponseDTO(Long uploadId, String fileName, String uploadStatus,
                                int extractedCount, int conflictCount, int totalParsed,
                                List<String> conflicts, List<String> errors,
                                List<TimetableEntryDTO> savedEntries, String message) {
        this.uploadId = uploadId;
        this.fileName = fileName;
        this.uploadStatus = uploadStatus;
        this.extractedCount = extractedCount;
        this.conflictCount = conflictCount;
        this.totalParsed = totalParsed;
        this.conflicts = conflicts != null ? conflicts : new ArrayList<>();
        this.errors = errors != null ? errors : new ArrayList<>();
        this.savedEntries = savedEntries != null ? savedEntries : new ArrayList<>();
        this.message = message;
    }

    public PdfUploadResponseDTO(Long uploadId, String fileName, String uploadStatus,
                                int extractedCount, int conflictCount, int totalParsed,
                                List<String> conflicts, List<String> errors,
                                List<TimetableEntryDTO> savedEntries, String message,
                                Long departmentId, String departmentName, String departmentCode,
                                List<String> sectionsInvolved) {
        this.uploadId = uploadId;
        this.fileName = fileName;
        this.uploadStatus = uploadStatus;
        this.extractedCount = extractedCount;
        this.conflictCount = conflictCount;
        this.totalParsed = totalParsed;
        this.conflicts = conflicts != null ? conflicts : new ArrayList<>();
        this.errors = errors != null ? errors : new ArrayList<>();
        this.savedEntries = savedEntries != null ? savedEntries : new ArrayList<>();
        this.message = message;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.sectionsInvolved = sectionsInvolved != null ? sectionsInvolved : new ArrayList<>();
    }

    public PdfUploadResponseDTO(Long uploadId, String fileName, String uploadStatus,
                                int extractedCount, int conflictCount, int totalParsed,
                                List<String> conflicts, List<String> errors,
                                List<TimetableEntryDTO> savedEntries, String message,
                                Long departmentId, String departmentName, String departmentCode,
                                List<String> sectionsInvolved,
                                Integer yearOfStudy, String yearName, Integer semesterNumber,
                                String semesterName, String academicYear) {
        this.uploadId = uploadId;
        this.fileName = fileName;
        this.uploadStatus = uploadStatus;
        this.extractedCount = extractedCount;
        this.conflictCount = conflictCount;
        this.totalParsed = totalParsed;
        this.conflicts = conflicts != null ? conflicts : new ArrayList<>();
        this.errors = errors != null ? errors : new ArrayList<>();
        this.savedEntries = savedEntries != null ? savedEntries : new ArrayList<>();
        this.message = message;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.sectionsInvolved = sectionsInvolved != null ? sectionsInvolved : new ArrayList<>();
        this.yearOfStudy = yearOfStudy;
        this.yearName = yearName;
        this.semesterNumber = semesterNumber;
        this.semesterName = semesterName;
        this.academicYear = academicYear;
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

    public String getUploadStatus() {
        return uploadStatus;
    }

    public void setUploadStatus(String uploadStatus) {
        this.uploadStatus = uploadStatus;
    }

    public int getExtractedCount() {
        return extractedCount;
    }

    public void setExtractedCount(int extractedCount) {
        this.extractedCount = extractedCount;
    }

    public int getConflictCount() {
        return conflictCount;
    }

    public void setConflictCount(int conflictCount) {
        this.conflictCount = conflictCount;
    }

    public int getTotalParsed() {
        return totalParsed;
    }

    public void setTotalParsed(int totalParsed) {
        this.totalParsed = totalParsed;
    }

    public List<String> getConflicts() {
        return conflicts;
    }

    public void setConflicts(List<String> conflicts) {
        this.conflicts = conflicts;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public List<TimetableEntryDTO> getSavedEntries() {
        return savedEntries;
    }

    public void setSavedEntries(List<TimetableEntryDTO> savedEntries) {
        this.savedEntries = savedEntries;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public List<String> getSectionsInvolved() {
        return sectionsInvolved;
    }

    public void setSectionsInvolved(List<String> sectionsInvolved) {
        this.sectionsInvolved = sectionsInvolved;
    }

    public Integer getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(Integer yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }

    public String getYearName() {
        return yearName;
    }

    public void setYearName(String yearName) {
        this.yearName = yearName;
    }

    public Integer getSemesterNumber() {
        return semesterNumber;
    }

    public void setSemesterNumber(Integer semesterNumber) {
        this.semesterNumber = semesterNumber;
    }

    public String getSemesterName() {
        return semesterName;
    }

    public void setSemesterName(String semesterName) {
        this.semesterName = semesterName;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }
}
