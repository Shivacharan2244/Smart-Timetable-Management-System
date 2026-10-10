package com.example.smarttimetable.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SectionDTO {
    private Long sectionId;

    @NotBlank(message = "Section name is required.")
    private String sectionName;

    @NotNull(message = "Department ID is required.")
    private Long departmentId;

    private String departmentName;
    private String departmentCode;

    @NotNull(message = "Semester ID is required.")
    private Long semesterId;

    private String semesterName;
    private Integer semesterNumber;
    private Integer yearOfStudy; // 1, 2, 3, 4
    private String yearName;     // "1st Year", "2nd Year", "3rd Year", "4th Year"
    private String status;

    public SectionDTO() {
    }

    public SectionDTO(Long sectionId, String sectionName, Long departmentId, String departmentName,
                      Long semesterId, String semesterName, String status) {
        this.sectionId = sectionId;
        this.sectionName = sectionName;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.semesterId = semesterId;
        this.semesterName = semesterName;
        this.status = status;
    }

    public SectionDTO(Long sectionId, String sectionName, Long departmentId, String departmentName, String departmentCode,
                      Long semesterId, String semesterName, Integer semesterNumber, Integer yearOfStudy, String yearName, String status) {
        this.sectionId = sectionId;
        this.sectionName = sectionName;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.semesterId = semesterId;
        this.semesterName = semesterName;
        this.semesterNumber = semesterNumber;
        this.yearOfStudy = yearOfStudy;
        this.yearName = yearName;
        this.status = status;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public void setSectionId(Long sectionId) {
        this.sectionId = sectionId;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
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

    public Integer getSemesterNumber() {
        return semesterNumber;
    }

    public void setSemesterNumber(Integer semesterNumber) {
        this.semesterNumber = semesterNumber;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
