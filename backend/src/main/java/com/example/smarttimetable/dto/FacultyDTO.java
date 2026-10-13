package com.example.smarttimetable.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FacultyDTO {
    private Long facultyId;

    @NotBlank(message = "Faculty name is required.")
    private String facultyName;

    @NotBlank(message = "Faculty code is required.")
    private String facultyCode;

    @NotBlank(message = "Email is required.")
    @Email(message = "Please provide a valid email address.")
    private String email;

    @NotNull(message = "Department ID is required.")
    private Long departmentId;

    private String departmentName;
    private String departmentCode;
    private String status;

    public FacultyDTO() {
    }

    public FacultyDTO(Long facultyId, String facultyName, String facultyCode, String email,
                      Long departmentId, String departmentName, String status) {
        this.facultyId = facultyId;
        this.facultyName = facultyName;
        this.facultyCode = facultyCode;
        this.email = email;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.status = status;
    }

    public Long getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(Long facultyId) {
        this.facultyId = facultyId;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public String getFacultyCode() {
        return facultyCode;
    }

    public void setFacultyCode(String facultyCode) {
        this.facultyCode = facultyCode;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
