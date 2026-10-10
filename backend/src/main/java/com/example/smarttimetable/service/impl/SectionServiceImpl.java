package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.SectionDTO;
import com.example.smarttimetable.entity.Department;
import com.example.smarttimetable.entity.Section;
import com.example.smarttimetable.entity.Semester;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ConflictException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.DepartmentRepository;
import com.example.smarttimetable.repository.SectionRepository;
import com.example.smarttimetable.repository.SemesterRepository;
import com.example.smarttimetable.service.SectionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SectionServiceImpl implements SectionService {

    private final SectionRepository sectionRepository;
    private final DepartmentRepository departmentRepository;
    private final SemesterRepository semesterRepository;

    public SectionServiceImpl(SectionRepository sectionRepository,
                              DepartmentRepository departmentRepository,
                              SemesterRepository semesterRepository) {
        this.sectionRepository = sectionRepository;
        this.departmentRepository = departmentRepository;
        this.semesterRepository = semesterRepository;
    }

    @Override
    @Transactional
    public SectionDTO createSection(SectionDTO dto) {
        if (dto.getSectionName() == null || dto.getSectionName().trim().isEmpty()) {
            throw new BusinessException("Section name cannot be empty.");
        }
        if (dto.getDepartmentId() == null) {
            throw new BusinessException("Department ID is required.");
        }
        if (dto.getSemesterId() == null) {
            throw new BusinessException("Semester ID is required.");
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));

        Semester semester = semesterRepository.findById(dto.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + dto.getSemesterId()));

        if (sectionRepository.existsBySectionNameAndDepartment_DepartmentIdAndSemester_SemesterId(
                dto.getSectionName().trim(), dto.getDepartmentId(), dto.getSemesterId())) {
            throw new ConflictException("Section '" + dto.getSectionName() + "' already exists for this department and semester.");
        }

        Section section = new Section();
        section.setSectionName(dto.getSectionName().trim());
        section.setDepartment(department);
        section.setSemester(semester);
        section.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        Section saved = sectionRepository.save(section);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SectionDTO getSectionById(Long id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + id));
        return mapToDTO(section);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SectionDTO> getAllSections() {
        return sectionRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SectionDTO updateSection(Long id, SectionDTO dto) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + id));

        if (dto.getDepartmentId() != null && !dto.getDepartmentId().equals(section.getDepartment().getDepartmentId())) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));
            section.setDepartment(department);
        }

        if (dto.getSemesterId() != null && !dto.getSemesterId().equals(section.getSemester().getSemesterId())) {
            Semester semester = semesterRepository.findById(dto.getSemesterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + dto.getSemesterId()));
            section.setSemester(semester);
        }

        if (dto.getSectionName() != null && !dto.getSectionName().trim().isEmpty()) {
            String newName = dto.getSectionName().trim();
            if (!newName.equalsIgnoreCase(section.getSectionName())) {
                if (sectionRepository.existsBySectionNameAndDepartment_DepartmentIdAndSemester_SemesterId(
                        newName, section.getDepartment().getDepartmentId(), section.getSemester().getSemesterId())) {
                    throw new ConflictException("Section '" + newName + "' already exists for this department and semester.");
                }
            }
            section.setSectionName(newName);
        }

        if (dto.getStatus() != null) {
            section.setStatus(dto.getStatus());
        }

        Section updated = sectionRepository.save(section);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteSection(Long id) {
        if (!sectionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Section not found with ID: " + id);
        }
        sectionRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SectionDTO> getSectionsByDepartment(Long departmentId) {
        return sectionRepository.findByDepartment_DepartmentId(departmentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SectionDTO> getSectionsBySemester(Long semesterId) {
        return sectionRepository.findBySemester_SemesterId(semesterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private SectionDTO mapToDTO(Section s) {
        SectionDTO dto = new SectionDTO();
        dto.setSectionId(s.getSectionId());
        dto.setSectionName(s.getSectionName());
        dto.setStatus(s.getStatus());
        if (s.getDepartment() != null) {
            dto.setDepartmentId(s.getDepartment().getDepartmentId());
            dto.setDepartmentName(s.getDepartment().getDepartmentName());
            dto.setDepartmentCode(s.getDepartment().getDepartmentCode());
        }
        if (s.getSemester() != null) {
            dto.setSemesterId(s.getSemester().getSemesterId());
            dto.setSemesterName(s.getSemester().getSemesterName());
            Integer semNum = s.getSemester().getSemesterNumber();
            dto.setSemesterNumber(semNum);
            if (semNum != null) {
                int yr = (semNum + 1) / 2;
                dto.setYearOfStudy(yr);
                dto.setYearName(yr == 1 ? "1st Year" : (yr == 2 ? "2nd Year" : (yr == 3 ? "3rd Year" : yr + "th Year")));
            }
        }
        return dto;
    }
}
