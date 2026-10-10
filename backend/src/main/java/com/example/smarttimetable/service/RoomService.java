package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.RoomDTO;

import java.util.List;

public interface RoomService {
    RoomDTO createRoom(RoomDTO dto);
    RoomDTO getRoomById(Long id);
    List<RoomDTO> getAllRooms();
    RoomDTO updateRoom(Long id, RoomDTO dto);
    void deleteRoom(Long id);
    RoomDTO getRoomByNumber(String roomNumber);
    List<RoomDTO> getRoomsByType(String roomType);
    List<RoomDTO> getActiveRooms();
}
