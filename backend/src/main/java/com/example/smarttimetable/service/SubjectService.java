package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.SubjectDTO;

import java.util.List;

public interface SubjectService {
    SubjectDTO createSubject(SubjectDTO dto);
    SubjectDTO getSubjectById(Long id);
    List<SubjectDTO> getAllSubjects();
    SubjectDTO updateSubject(Long id, SubjectDTO dto);
    void deleteSubject(Long id);
    SubjectDTO getSubjectByCode(String code);
    List<SubjectDTO> getSubjectsByDepartment(Long departmentId);
    List<SubjectDTO> getSubjectsBySemester(Long semesterId);
}
