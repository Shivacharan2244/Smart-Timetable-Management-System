package com.example.smarttimetable.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;

    @NotBlank(message = "Room name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String roomName;

    @NotBlank(message = "Room number is required")
    @Size(max = 30)
    @Column(nullable = false, unique = true, length = 30)
    private String roomNumber;

    @NotBlank(message = "Room type is required")
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String roomType = "CLASSROOM";

    @NotNull(message = "Capacity is required")
    @Min(1)
    @Column(nullable = false)
    private Integer capacity = 60;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    public Room() {
    }

    public Room(String roomName, String roomNumber, String roomType, Integer capacity, String status) {
        this.roomName = roomName;
        this.roomNumber = roomNumber;
        this.roomType = roomType != null ? roomType : "CLASSROOM";
        this.capacity = capacity != null ? capacity : 60;
        this.status = status != null ? status : "ACTIVE";
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
