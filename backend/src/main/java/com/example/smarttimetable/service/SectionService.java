package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.SectionDTO;

import java.util.List;

public interface SectionService {
    SectionDTO createSection(SectionDTO dto);
    SectionDTO getSectionById(Long id);
    List<SectionDTO> getAllSections();
    SectionDTO updateSection(Long id, SectionDTO dto);
    void deleteSection(Long id);
    List<SectionDTO> getSectionsByDepartment(Long departmentId);
    List<SectionDTO> getSectionsBySemester(Long semesterId);
}
