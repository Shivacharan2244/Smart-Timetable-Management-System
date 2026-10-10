package com.example.smarttimetable.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "semesters")
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long semesterId;

    @NotNull(message = "Semester number is required")
    @Min(1)
    @Max(12)
    @Column(nullable = false)
    private Integer semesterNumber;

    @NotBlank(message = "Semester name is required")
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String semesterName;

    @NotNull(message = "Academic year is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    public Semester() {
    }

    public Semester(Integer semesterNumber, String semesterName, AcademicYear academicYear, String status) {
        this.semesterNumber = semesterNumber;
        this.semesterName = semesterName;
        this.academicYear = academicYear;
        this.status = status != null ? status : "ACTIVE";
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

    public AcademicYear getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(AcademicYear academicYear) {
        this.academicYear = academicYear;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
