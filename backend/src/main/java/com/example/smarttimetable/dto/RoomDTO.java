package com.example.smarttimetable.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class RoomDTO {
    private Long roomId;
    private String roomName;

    @NotBlank(message = "Room number is required.")
    private String roomNumber;

    @NotBlank(message = "Room type is required (e.g. CLASSROOM, LAB, SEMINAR_HALL).")
    private String roomType;

    @NotNull(message = "Room capacity is required.")
    @Positive(message = "Room capacity must be greater than zero.")
    private Integer capacity;

    private String status;

    public RoomDTO() {
    }

    public RoomDTO(Long roomId, String roomName, String roomNumber, String roomType, Integer capacity, String status) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.capacity = capacity;
        this.status = status;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
