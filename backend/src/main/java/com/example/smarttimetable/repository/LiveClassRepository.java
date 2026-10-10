package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.LiveClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LiveClassRepository extends JpaRepository<LiveClass, Long> {

    List<LiveClass> findByStatus(String status);

    Optional<LiveClass> findByTimetableEntry_EntryId(Long entryId);

    List<LiveClass> findByTimetableEntry_Timetable_TimetableId(Long timetableId);

    List<LiveClass> findByTimetableEntry_Faculty_FacultyId(Long facultyId);

    List<LiveClass> findByTimetableEntry_Faculty_FacultyIdAndStatus(Long facultyId, String status);

    List<LiveClass> findByStatusIn(List<String> statuses);

    Optional<LiveClass> findFirstByTimetableEntry_Faculty_FacultyIdAndStatus(Long facultyId, String status);

    long countByStatus(String status);
}
