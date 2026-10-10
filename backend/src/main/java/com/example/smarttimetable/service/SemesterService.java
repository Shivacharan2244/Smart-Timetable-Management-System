package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.SemesterDTO;

import java.util.List;

public interface SemesterService {
    SemesterDTO createSemester(SemesterDTO dto);
    SemesterDTO getSemesterById(Long id);
    List<SemesterDTO> getAllSemesters();
    SemesterDTO updateSemester(Long id, SemesterDTO dto);
    void deleteSemester(Long id);
    List<SemesterDTO> getSemestersByAcademicYear(Long academicYearId);
}
