package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.TimetableEntryDTO;

import java.util.List;

public interface TimetableEntryService {
    TimetableEntryDTO createEntry(TimetableEntryDTO dto);
    TimetableEntryDTO getEntryById(Long id);
    List<TimetableEntryDTO> getAllEntries();
    TimetableEntryDTO updateEntry(Long id, TimetableEntryDTO dto);
    void deleteEntry(Long id);
    List<TimetableEntryDTO> getEntriesByTimetable(Long timetableId);
    List<TimetableEntryDTO> getEntriesByFaculty(Long facultyId);
    List<TimetableEntryDTO> getEntriesByRoom(Long roomId);
    List<TimetableEntryDTO> getEntriesByRoom(Long roomId, String dayOfWeek);
    List<TimetableEntryDTO> getEntriesBySection(Long sectionId);
    List<TimetableEntryDTO> getEntriesBySection(Long sectionId, String dayOfWeek);
    List<TimetableEntryDTO> getEntriesByFacultyAndDay(Long facultyId, String dayOfWeek);
    List<TimetableEntryDTO> getEntriesByDay(String dayOfWeek);
}
