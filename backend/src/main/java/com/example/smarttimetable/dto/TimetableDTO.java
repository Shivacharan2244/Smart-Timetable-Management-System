package com.example.smarttimetable.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class TimetableDTO {
    private Long timetableId;

    @NotNull(message = "Department ID is required.")
    private Long departmentId;

    private String departmentName;

    @NotNull(message = "Academic year ID is required.")
    private Long academicYearId;

    private String academicYearName;

    @NotNull(message = "Semester ID is required.")
    private Long semesterId;

    private String semesterName;

    @NotNull(message = "Section ID is required.")
    private Long sectionId;

    private String sectionName;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Integer versionNumber;
    private Boolean active;
    private String status;

    public TimetableDTO() {
    }

    public TimetableDTO(Long timetableId, Long departmentId, String departmentName,
                        Long academicYearId, String academicYearName, Long semesterId,
                        String semesterName, Long sectionId, String sectionName,
                        LocalDate effectiveFrom, LocalDate effectiveTo,
                        Integer versionNumber, Boolean active, String status) {
        this.timetableId = timetableId;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.academicYearId = academicYearId;
        this.academicYearName = academicYearName;
        this.semesterId = semesterId;
        this.semesterName = semesterName;
        this.sectionId = sectionId;
        this.sectionName = sectionName;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
        this.versionNumber = versionNumber;
        this.active = active;
        this.status = status;
    }

    public Long getTimetableId() {
        return timetableId;
    }

    public void setTimetableId(Long timetableId) {
        this.timetableId = timetableId;
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

    public Long getAcademicYearId() {
        return academicYearId;
    }

    public void setAcademicYearId(Long academicYearId) {
        this.academicYearId = academicYearId;
    }

    public String getAcademicYearName() {
        return academicYearName;
    }

    public void setAcademicYearName(String academicYearName) {
        this.academicYearName = academicYearName;
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

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
