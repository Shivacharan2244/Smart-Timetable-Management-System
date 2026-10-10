package com.example.smarttimetable.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long departmentId;

    @NotBlank(message = "Department name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String departmentName;

    @NotBlank(message = "Department code is required")
    @Size(max = 20)
    @Column(nullable = false, unique = true, length = 20)
    private String departmentCode;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    public Department() {
    }

    public Department(String departmentName, String departmentCode, String status) {
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.status = status != null ? status : "ACTIVE";
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
