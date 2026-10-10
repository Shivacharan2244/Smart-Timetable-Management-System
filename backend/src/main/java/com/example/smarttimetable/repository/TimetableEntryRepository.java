package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {

    List<TimetableEntry> findByTimetable_TimetableId(Long timetableId);

    List<TimetableEntry> findByFaculty_FacultyId(Long facultyId);

    List<TimetableEntry> findByFaculty_FacultyIdAndDayOfWeek(Long facultyId, String dayOfWeek);

    List<TimetableEntry> findByRoom_RoomIdAndDayOfWeek(Long roomId, String dayOfWeek);

    List<TimetableEntry> findByRoom_RoomId(Long roomId);

    List<TimetableEntry> findByTimetable_Section_SectionIdAndDayOfWeek(Long sectionId, String dayOfWeek);

    List<TimetableEntry> findByTimetable_Section_SectionId(Long sectionId);

    List<TimetableEntry> findByDayOfWeek(String dayOfWeek);

    // =========================================================================
    // 1. DUPLICATE ENTRY CHECK
    // =========================================================================
    boolean existsByTimetable_TimetableIdAndDayOfWeekAndTimeSlot_TimeSlotId(
            Long timetableId,
            String dayOfWeek,
            Long timeSlotId
    );

    @Query("SELECT CASE WHEN COUNT(te) > 0 THEN true ELSE false END FROM TimetableEntry te " +
           "WHERE te.timetable.timetableId = :timetableId " +
           "AND te.dayOfWeek = :dayOfWeek " +
           "AND te.timeSlot.timeSlotId = :timeSlotId " +
           "AND (:excludeEntryId IS NULL OR te.entryId != :excludeEntryId)")
    boolean isDuplicateEntry(
            @Param("timetableId") Long timetableId,
            @Param("dayOfWeek") String dayOfWeek,
            @Param("timeSlotId") Long timeSlotId,
            @Param("excludeEntryId") Long excludeEntryId
    );

    // =========================================================================
    // 2. FACULTY CONFLICT DETECTION
    // =========================================================================
    @Query("SELECT te FROM TimetableEntry te " +
           "WHERE te.faculty.facultyId = :facultyId " +
           "AND te.dayOfWeek = :dayOfWeek " +
           "AND te.timeSlot.timeSlotId = :timeSlotId " +
           "AND (:excludeEntryId IS NULL OR te.entryId != :excludeEntryId) " +
           "AND te.status = 'ACTIVE'")
    List<TimetableEntry> findFacultyConflicts(
            @Param("facultyId") Long facultyId,
            @Param("dayOfWeek") String dayOfWeek,
            @Param("timeSlotId") Long timeSlotId,
            @Param("excludeEntryId") Long excludeEntryId
    );

    @Query("SELECT CASE WHEN COUNT(te) > 0 THEN true ELSE false END FROM TimetableEntry te " +
           "WHERE te.faculty.facultyId = :facultyId " +
           "AND te.dayOfWeek = :dayOfWeek " +
           "AND te.timeSlot.timeSlotId = :timeSlotId " +
           "AND (:excludeEntryId IS NULL OR te.entryId != :excludeEntryId) " +
           "AND te.status = 'ACTIVE'")
    boolean hasFacultyConflict(
            @Param("facultyId") Long facultyId,
            @Param("dayOfWeek") String dayOfWeek,
            @Param("timeSlotId") Long timeSlotId,
            @Param("excludeEntryId") Long excludeEntryId
    );

    // =========================================================================
    // 3. ROOM CONFLICT DETECTION
    // =========================================================================
    @Query("SELECT te FROM TimetableEntry te " +
           "WHERE te.room.roomId = :roomId " +
           "AND te.dayOfWeek = :dayOfWeek " +
           "AND te.timeSlot.timeSlotId = :timeSlotId " +
           "AND (:excludeEntryId IS NULL OR te.entryId != :excludeEntryId) " +
           "AND te.status = 'ACTIVE'")
    List<TimetableEntry> findRoomConflicts(
            @Param("roomId") Long roomId,
            @Param("dayOfWeek") String dayOfWeek,
            @Param("timeSlotId") Long timeSlotId,
            @Param("excludeEntryId") Long excludeEntryId
    );

    @Query("SELECT CASE WHEN COUNT(te) > 0 THEN true ELSE false END FROM TimetableEntry te " +
           "WHERE te.room.roomId = :roomId " +
           "AND te.dayOfWeek = :dayOfWeek " +
           "AND te.timeSlot.timeSlotId = :timeSlotId " +
           "AND (:excludeEntryId IS NULL OR te.entryId != :excludeEntryId) " +
           "AND te.status = 'ACTIVE'")
    boolean hasRoomConflict(
            @Param("roomId") Long roomId,
            @Param("dayOfWeek") String dayOfWeek,
            @Param("timeSlotId") Long timeSlotId,
            @Param("excludeEntryId") Long excludeEntryId
    );

    // =========================================================================
    // 4. SECTION CONFLICT DETECTION
    // =========================================================================
    @Query("SELECT te FROM TimetableEntry te " +
           "WHERE te.timetable.section.sectionId = :sectionId " +
           "AND te.dayOfWeek = :dayOfWeek " +
           "AND te.timeSlot.timeSlotId = :timeSlotId " +
           "AND (:excludeEntryId IS NULL OR te.entryId != :excludeEntryId) " +
           "AND te.status = 'ACTIVE'")
    List<TimetableEntry> findSectionConflicts(
            @Param("sectionId") Long sectionId,
            @Param("dayOfWeek") String dayOfWeek,
            @Param("timeSlotId") Long timeSlotId,
            @Param("excludeEntryId") Long excludeEntryId
    );

    @Query("SELECT CASE WHEN COUNT(te) > 0 THEN true ELSE false END FROM TimetableEntry te " +
           "WHERE te.timetable.section.sectionId = :sectionId " +
           "AND te.dayOfWeek = :dayOfWeek " +
           "AND te.timeSlot.timeSlotId = :timeSlotId " +
           "AND (:excludeEntryId IS NULL OR te.entryId != :excludeEntryId) " +
           "AND te.status = 'ACTIVE'")
    boolean hasSectionConflict(
            @Param("sectionId") Long sectionId,
            @Param("dayOfWeek") String dayOfWeek,
            @Param("timeSlotId") Long timeSlotId,
            @Param("excludeEntryId") Long excludeEntryId
    );

    // =========================================================================
    // 5. BUSY FACULTY IDS QUERY (FOR FREE FACULTY ENGINE)
    // =========================================================================
    @Query("SELECT DISTINCT te.faculty.facultyId FROM TimetableEntry te " +
           "WHERE te.dayOfWeek = :dayOfWeek " +
           "AND te.timeSlot.timeSlotId = :timeSlotId " +
           "AND te.status = 'ACTIVE'")
    List<Long> findBusyFacultyIds(
            @Param("dayOfWeek") String dayOfWeek,
            @Param("timeSlotId") Long timeSlotId
    );

    List<TimetableEntry> findByUploadHistory_UploadId(Long uploadId);

    void deleteByUploadHistory_UploadId(Long uploadId);
}
