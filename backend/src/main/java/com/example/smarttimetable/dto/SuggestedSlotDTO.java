package com.example.smarttimetable.dto;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class SuggestedSlotDTO {
    private LocalTime startTime;
    private LocalTime endTime;
    private String formattedSlot;
    private int durationMinutes;
    private String facultyName;
    private String roomNumber;

    public SuggestedSlotDTO() {
    }

    public SuggestedSlotDTO(LocalTime startTime, LocalTime endTime, int durationMinutes,
                            String facultyName, String roomNumber) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.facultyName = facultyName;
        this.roomNumber = roomNumber;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        this.formattedSlot = (startTime != null && endTime != null)
                ? startTime.format(formatter) + " – " + endTime.format(formatter)
                : "";
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getFormattedSlot() {
        return formattedSlot;
    }

    public void setFormattedSlot(String formattedSlot) {
        this.formattedSlot = formattedSlot;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }
}
