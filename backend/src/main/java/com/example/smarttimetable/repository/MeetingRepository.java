package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findByFaculty_FacultyId(Long facultyId);

    List<Meeting> findByFaculty_FacultyIdAndDate(Long facultyId, LocalDate date);

    List<Meeting> findByRoom_RoomId(Long roomId);

    List<Meeting> findByDate(LocalDate date);

    List<Meeting> findByStatus(String status);

    List<Meeting> findByDateAndStatus(LocalDate date, String status);

    long countByDateGreaterThanEqualAndStatus(LocalDate date, String status);

    // =========================================================================
    // 1. FACULTY MEETING CONFLICT DETECTION
    // =========================================================================
    @Query("SELECT m FROM Meeting m " +
           "WHERE m.faculty.facultyId = :facultyId " +
           "AND m.date = :date " +
           "AND m.startTime < :endTime AND m.endTime > :startTime " +
           "AND (:excludeMeetingId IS NULL OR m.meetingId != :excludeMeetingId) " +
           "AND m.status != 'CANCELLED'")
    List<Meeting> findFacultyMeetingConflicts(
            @Param("facultyId") Long facultyId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeMeetingId") Long excludeMeetingId
    );

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Meeting m " +
           "WHERE m.faculty.facultyId = :facultyId " +
           "AND m.date = :date " +
           "AND m.startTime < :endTime AND m.endTime > :startTime " +
           "AND (:excludeMeetingId IS NULL OR m.meetingId != :excludeMeetingId) " +
           "AND m.status != 'CANCELLED'")
    boolean hasFacultyMeetingConflict(
            @Param("facultyId") Long facultyId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeMeetingId") Long excludeMeetingId
    );

    // =========================================================================
    // 2. ROOM MEETING CONFLICT DETECTION
    // =========================================================================
    @Query("SELECT m FROM Meeting m " +
           "WHERE m.room.roomId = :roomId " +
           "AND m.date = :date " +
           "AND m.startTime < :endTime AND m.endTime > :startTime " +
           "AND (:excludeMeetingId IS NULL OR m.meetingId != :excludeMeetingId) " +
           "AND m.status != 'CANCELLED'")
    List<Meeting> findRoomMeetingConflicts(
            @Param("roomId") Long roomId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeMeetingId") Long excludeMeetingId
    );

    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Meeting m " +
           "WHERE m.room.roomId = :roomId " +
           "AND m.date = :date " +
           "AND m.startTime < :endTime AND m.endTime > :startTime " +
           "AND (:excludeMeetingId IS NULL OR m.meetingId != :excludeMeetingId) " +
           "AND m.status != 'CANCELLED'")
    boolean hasRoomMeetingConflict(
            @Param("roomId") Long roomId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeMeetingId") Long excludeMeetingId
    );

    // =========================================================================
    // 3. BUSY FACULTY IDS IN MEETINGS (FOR FREE FACULTY ENGINE)
    // =========================================================================
    @Query("SELECT DISTINCT m.faculty.facultyId FROM Meeting m " +
           "WHERE m.date = :date " +
           "AND m.startTime < :endTime AND m.endTime > :startTime " +
           "AND m.status != 'CANCELLED'")
    List<Long> findFacultyIdsInMeetings(
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );
}
