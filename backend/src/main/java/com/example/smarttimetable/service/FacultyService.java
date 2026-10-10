package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.FacultyDTO;

import java.util.List;

public interface FacultyService {
    FacultyDTO createFaculty(FacultyDTO dto);
    FacultyDTO getFacultyById(Long id);
    List<FacultyDTO> getAllFaculties();
    FacultyDTO updateFaculty(Long id, FacultyDTO dto);
    void deleteFaculty(Long id);
    FacultyDTO getFacultyByCode(String code);
    FacultyDTO getFacultyByEmail(String email);
    List<FacultyDTO> getFacultiesByDepartment(Long departmentId);
    List<FacultyDTO> getActiveFaculties();
    List<FacultyDTO> getFreeFaculty(java.time.LocalDate date, String day, Long timeSlotId, Long departmentId, Long subjectId);
    List<com.example.smarttimetable.dto.FacultyMatrixDTO> getFacultyMatrix(java.time.LocalDate date, String day, Long timeSlotId, Long departmentId);
}
