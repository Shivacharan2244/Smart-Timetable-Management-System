package com.example.smarttimetable.dto;

public class DashboardStatsDTO {
    private long totalFaculty;
    private long totalRooms;
    private long totalSubjects;
    private long totalSections;
    private long totalTimetableEntries;
    private long activeClasses;
    private long upcomingMeetings;

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(long totalFaculty, long totalRooms, long totalSubjects, long totalSections,
                             long totalTimetableEntries, long activeClasses, long upcomingMeetings) {
        this.totalFaculty = totalFaculty;
        this.totalRooms = totalRooms;
        this.totalSubjects = totalSubjects;
        this.totalSections = totalSections;
        this.totalTimetableEntries = totalTimetableEntries;
        this.activeClasses = activeClasses;
        this.upcomingMeetings = upcomingMeetings;
    }

    public long getTotalFaculty() {
        return totalFaculty;
    }

    public void setTotalFaculty(long totalFaculty) {
        this.totalFaculty = totalFaculty;
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(long totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public long getTotalSections() {
        return totalSections;
    }

    public void setTotalSections(long totalSections) {
        this.totalSections = totalSections;
    }

    public long getTotalTimetableEntries() {
        return totalTimetableEntries;
    }

    public void setTotalTimetableEntries(long totalTimetableEntries) {
        this.totalTimetableEntries = totalTimetableEntries;
    }

    public long getActiveClasses() {
        return activeClasses;
    }

    public void setActiveClasses(long activeClasses) {
        this.activeClasses = activeClasses;
    }

    public long getUpcomingMeetings() {
        return upcomingMeetings;
    }

    public void setUpcomingMeetings(long upcomingMeetings) {
        this.upcomingMeetings = upcomingMeetings;
    }
}
