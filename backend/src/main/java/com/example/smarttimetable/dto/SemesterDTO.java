package com.example.smarttimetable.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class SemesterDTO {
    private Long semesterId;

    @NotNull(message = "Semester number is required.")
    @Positive(message = "Semester number must be positive.")
    private Integer semesterNumber;

    @NotBlank(message = "Semester name is required.")
    private String semesterName;

    @NotNull(message = "Academic year ID is required.")
    private Long academicYearId;

    private String academicYearName;
    private String status;

    public SemesterDTO() {
    }

    public SemesterDTO(Long semesterId, Integer semesterNumber, String semesterName,
                       Long academicYearId, String academicYearName, String status) {
        this.semesterId = semesterId;
        this.semesterNumber = semesterNumber;
        this.semesterName = semesterName;
        this.academicYearId = academicYearId;
        this.academicYearName = academicYearName;
        this.status = status;
    }

    public Long getSemesterId() {
        return semesterId;
    }

    public void setSemesterId(Long semesterId) {
        this.semesterId = semesterId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
