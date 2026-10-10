package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomNumber(String roomNumber);

    boolean existsByRoomNumber(String roomNumber);

    List<Room> findByRoomName(String roomName);

    List<Room> findByRoomType(String roomType);

    List<Room> findByCapacityGreaterThanEqual(Integer minCapacity);

    List<Room> findByStatus(String status);
}
