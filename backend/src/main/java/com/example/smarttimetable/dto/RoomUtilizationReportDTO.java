package com.example.smarttimetable.dto;

public class RoomUtilizationReportDTO {
    private Long roomId;
    private String roomNumber;
    private String roomType;
    private Integer capacity;
    private int classCount;
    private double occupiedHours;
    private double utilizationPercentage;

    public RoomUtilizationReportDTO() {
    }

    public RoomUtilizationReportDTO(Long roomId, String roomNumber, String roomType,
                                  Integer capacity, int classCount, double occupiedHours,
                                  double utilizationPercentage) {
        this.roomId = roomId;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.capacity = capacity;
        this.classCount = classCount;
        this.occupiedHours = occupiedHours;
        this.utilizationPercentage = Math.round(utilizationPercentage * 10.0) / 10.0;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
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

    public int getClassCount() {
        return classCount;
    }

    public void setClassCount(int classCount) {
        this.classCount = classCount;
    }

    public double getOccupiedHours() {
        return occupiedHours;
    }

    public void setOccupiedHours(double occupiedHours) {
        this.occupiedHours = occupiedHours;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public int getAssignedEntriesCount() {
        return classCount;
    }
}
