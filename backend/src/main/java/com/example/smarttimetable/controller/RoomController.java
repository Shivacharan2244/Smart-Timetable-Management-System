package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.RoomDTO;
import com.example.smarttimetable.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomDTO>>> getAllRooms() {
        List<RoomDTO> list = roomService.getAllRooms();
        return ResponseEntity.ok(ApiResponse.success("Rooms retrieved successfully.", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomDTO>> getRoomById(@PathVariable Long id) {
        RoomDTO dto = roomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.success("Room retrieved successfully.", dto));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<RoomDTO>>> getActiveRooms() {
        List<RoomDTO> list = roomService.getActiveRooms();
        return ResponseEntity.ok(ApiResponse.success("Active rooms retrieved successfully.", list));
    }

    @GetMapping("/type/{roomType}")
    public ResponseEntity<ApiResponse<List<RoomDTO>>> getRoomsByType(@PathVariable String roomType) {
        List<RoomDTO> list = roomService.getRoomsByType(roomType);
        return ResponseEntity.ok(ApiResponse.success("Rooms of type retrieved successfully.", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoomDTO>> createRoom(@Valid @RequestBody RoomDTO dto) {
        RoomDTO created = roomService.createRoom(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Room created successfully.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomDTO>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomDTO dto) {
        RoomDTO updated = roomService.updateRoom(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Room updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Room deleted successfully."));
    }
}
