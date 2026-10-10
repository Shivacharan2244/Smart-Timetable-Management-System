package com.example.smarttimetable.dto;

public class FacultyMatrixDTO {
    private Long facultyId;
    private String facultyName;
    private String facultyCode;
    private String email;
    private Long departmentId;
    private String departmentName;
    private String status;           // FREE, BUSY, MEETING, UNAVAILABLE
    private String currentClass;     // e.g. "AI & ML (AIML301) in Room A-204"
    private String freePeriod;       // e.g. "10:00 – 11:00"
    private int todayWorkload;       // Number of classes scheduled today

    public FacultyMatrixDTO() {
    }

    public FacultyMatrixDTO(Long facultyId, String facultyName, String facultyCode, String email,
                            Long departmentId, String departmentName, String status,
                            String currentClass, String freePeriod, int todayWorkload) {
        this.facultyId = facultyId;
        this.facultyName = facultyName;
        this.facultyCode = facultyCode;
        this.email = email;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.status = status;
        this.currentClass = currentClass;
        this.freePeriod = freePeriod;
        this.todayWorkload = todayWorkload;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCurrentClass() {
        return currentClass;
    }

    public void setCurrentClass(String currentClass) {
        this.currentClass = currentClass;
    }

    public String getFreePeriod() {
        return freePeriod;
    }

    public void setFreePeriod(String freePeriod) {
        this.freePeriod = freePeriod;
    }

    public int getTodayWorkload() {
        return todayWorkload;
    }

    public void setTodayWorkload(int todayWorkload) {
        this.todayWorkload = todayWorkload;
    }
}
