package com.example.smarttimetable.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SubjectDTO {
    private Long subjectId;

    @NotBlank(message = "Subject name is required.")
    private String subjectName;

    @NotBlank(message = "Subject code is required.")
    private String subjectCode;

    @NotNull(message = "Department ID is required.")
    private Long departmentId;

    private String departmentName;
    private String departmentCode;

    @NotNull(message = "Semester ID is required.")
    private Long semesterId;

    private String semesterName;
    private String status;

    public SubjectDTO() {
    }

    public SubjectDTO(Long subjectId, String subjectName, String subjectCode, Long departmentId,
                      String departmentName, Long semesterId, String semesterName, String status) {
        this.subjectId = subjectId;
        this.subjectName = subjectName;
        this.subjectCode = subjectCode;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.semesterId = semesterId;
        this.semesterName = semesterName;
        this.status = status;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
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

    public Long getSemesterId() {
        return semesterId;
    }

    public void setSemesterId(Long semesterId) {
        this.semesterId = semesterId;
    }

    public String getSemesterName() {
        return semesterName;
    }

    public void setSemesterName(String semesterName) {
        this.semesterName = semesterName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
