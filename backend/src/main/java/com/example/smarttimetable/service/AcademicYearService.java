package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.AcademicYearDTO;

import java.util.List;

public interface AcademicYearService {
    AcademicYearDTO createAcademicYear(AcademicYearDTO dto);
    AcademicYearDTO getAcademicYearById(Long id);
    List<AcademicYearDTO> getAllAcademicYears();
    AcademicYearDTO updateAcademicYear(Long id, AcademicYearDTO dto);
    void deleteAcademicYear(Long id);
    List<AcademicYearDTO> getActiveAcademicYears();
    AcademicYearDTO activateAcademicYear(Long id);
}
