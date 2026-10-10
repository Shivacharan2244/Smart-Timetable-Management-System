package com.example.smarttimetable.dto;

public class FacultyWorkloadReportDTO {
    private Long facultyId;
    private String facultyName;
    private String facultyCode;
    private String departmentName;
    private int classCount;
    private double totalHours;

    public FacultyWorkloadReportDTO() {
    }

    public FacultyWorkloadReportDTO(Long facultyId, String facultyName, String facultyCode,
                                  String departmentName, int classCount, double totalHours) {
        this.facultyId = facultyId;
        this.facultyName = facultyName;
        this.facultyCode = facultyCode;
        this.departmentName = departmentName;
        this.classCount = classCount;
        this.totalHours = totalHours;
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

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public int getClassCount() {
        return classCount;
    }

    public void setClassCount(int classCount) {
        this.classCount = classCount;
    }

    public double getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(double totalHours) {
        this.totalHours = totalHours;
    }

    public int getAssignedClassesCount() {
        return classCount;
    }

    public double getWeeklyHours() {
        return totalHours;
    }
}
