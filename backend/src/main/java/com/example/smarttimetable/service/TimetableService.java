package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.TimetableDTO;

import java.util.List;

public interface TimetableService {
    TimetableDTO createTimetable(TimetableDTO dto);
    TimetableDTO getTimetableById(Long id);
    List<TimetableDTO> getAllTimetables();
    TimetableDTO updateTimetable(Long id, TimetableDTO dto);
    void deleteTimetable(Long id);
    List<TimetableDTO> getActiveTimetables();
    List<TimetableDTO> getTimetablesByDepartment(Long departmentId);
    List<TimetableDTO> getTimetablesBySection(Long sectionId);
    List<TimetableDTO> getTimetablesBySemester(Long semesterId);
}
