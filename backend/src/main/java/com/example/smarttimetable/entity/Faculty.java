package com.example.smarttimetable.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "faculties")
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long facultyId;

    @NotBlank(message = "Faculty name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String facultyName;

    @NotBlank(message = "Faculty code is required")
    @Size(max = 30)
    @Column(nullable = false, unique = true, length = 30)
    private String facultyCode;

    @NotBlank(message = "Faculty email is required")
    @Email(message = "Valid email is required")
    @Size(max = 120)
    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @NotNull(message = "Department is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    public Faculty() {
    }

    public Faculty(String facultyName, String facultyCode, String email, Department department, String status) {
        this.facultyName = facultyName;
        this.facultyCode = facultyCode;
        this.email = email;
        this.department = department;
        this.status = status != null ? status : "ACTIVE";
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

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
