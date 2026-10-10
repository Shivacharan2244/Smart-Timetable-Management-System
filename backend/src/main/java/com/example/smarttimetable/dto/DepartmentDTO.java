package com.example.smarttimetable.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DepartmentDTO {
    private Long departmentId;

    @NotBlank(message = "Department name is required.")
    @Size(max = 100, message = "Department name cannot exceed 100 characters.")
    private String departmentName;

    @NotBlank(message = "Department code is required.")
    @Size(max = 20, message = "Department code cannot exceed 20 characters.")
    private String departmentCode;

    private String status;

    public DepartmentDTO() {
    }

    public DepartmentDTO(Long departmentId, String departmentName, String departmentCode, String status) {
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.status = status;
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
