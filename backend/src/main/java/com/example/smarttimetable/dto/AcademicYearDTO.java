package com.example.smarttimetable.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AcademicYearDTO {
    private Long academicYearId;

    @NotBlank(message = "Academic year name is required (e.g. 2026-2027).")
    private String academicYear;

    @NotNull(message = "Start date is required.")
    private LocalDate startDate;

    @NotNull(message = "End date is required.")
    private LocalDate endDate;

    private Boolean active;
    private String status;

    public AcademicYearDTO() {
    }

    public AcademicYearDTO(Long academicYearId, String academicYear, LocalDate startDate,
                           LocalDate endDate, Boolean active, String status) {
        this.academicYearId = academicYearId;
        this.academicYear = academicYear;
        this.startDate = startDate;
        this.endDate = endDate;
        this.active = active;
        this.status = status;
    }

    public Long getAcademicYearId() {
        return academicYearId;
    }

    public void setAcademicYearId(Long academicYearId) {
        this.academicYearId = academicYearId;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
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
