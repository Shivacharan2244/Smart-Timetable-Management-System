package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.RoomDTO;
import com.example.smarttimetable.entity.Room;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ConflictException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.RoomRepository;
import com.example.smarttimetable.service.RoomService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;

    public RoomServiceImpl(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Override
    @Transactional
    public RoomDTO createRoom(RoomDTO dto) {
        if (dto.getRoomNumber() == null || dto.getRoomNumber().trim().isEmpty()) {
            throw new BusinessException("Room number cannot be empty.");
        }
        if (dto.getRoomName() == null || dto.getRoomName().trim().isEmpty()) {
            throw new BusinessException("Room name cannot be empty.");
        }
        if (dto.getCapacity() == null || dto.getCapacity() <= 0) {
            throw new BusinessException("Room capacity must be greater than zero.");
        }
        if (roomRepository.existsByRoomNumber(dto.getRoomNumber().trim().toUpperCase())) {
            throw new ConflictException("Room number already exists: " + dto.getRoomNumber());
        }

        Room room = new Room();
        room.setRoomNumber(dto.getRoomNumber().trim().toUpperCase());
        room.setRoomName(dto.getRoomName().trim());
        room.setRoomType(dto.getRoomType() != null ? dto.getRoomType().trim() : "CLASSROOM");
        room.setCapacity(dto.getCapacity());
        room.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        Room saved = roomRepository.save(room);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
        return mapToDTO(room);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoomDTO updateRoom(Long id, RoomDTO dto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        if (dto.getRoomNumber() != null && !dto.getRoomNumber().equalsIgnoreCase(room.getRoomNumber())) {
            if (roomRepository.existsByRoomNumber(dto.getRoomNumber().trim().toUpperCase())) {
                throw new ConflictException("Room number already in use: " + dto.getRoomNumber());
            }
            room.setRoomNumber(dto.getRoomNumber().trim().toUpperCase());
        }

        if (dto.getRoomName() != null && !dto.getRoomName().trim().isEmpty()) {
            room.setRoomName(dto.getRoomName().trim());
        }
        if (dto.getRoomType() != null && !dto.getRoomType().trim().isEmpty()) {
            room.setRoomType(dto.getRoomType().trim());
        }
        if (dto.getCapacity() != null) {
            if (dto.getCapacity() <= 0) {
                throw new BusinessException("Room capacity must be greater than zero.");
            }
            room.setCapacity(dto.getCapacity());
        }
        if (dto.getStatus() != null) {
            room.setStatus(dto.getStatus());
        }

        Room updated = roomRepository.save(room);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Room not found with ID: " + id);
        }
        roomRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomDTO getRoomByNumber(String roomNumber) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with number: " + roomNumber));
        return mapToDTO(room);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getRoomsByType(String roomType) {
        return roomRepository.findByRoomType(roomType).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO> getActiveRooms() {
        return roomRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private RoomDTO mapToDTO(Room r) {
        return new RoomDTO(
                r.getRoomId(),
                r.getRoomName(),
                r.getRoomNumber(),
                r.getRoomType(),
                r.getCapacity(),
                r.getStatus()
        );
    }
}
