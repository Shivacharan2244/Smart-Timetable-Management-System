package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.SemesterDTO;
import com.example.smarttimetable.entity.AcademicYear;
import com.example.smarttimetable.entity.Semester;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ConflictException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.AcademicYearRepository;
import com.example.smarttimetable.repository.SemesterRepository;
import com.example.smarttimetable.service.SemesterService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SemesterServiceImpl implements SemesterService {

    private final SemesterRepository semesterRepository;
    private final AcademicYearRepository academicYearRepository;

    public SemesterServiceImpl(SemesterRepository semesterRepository, AcademicYearRepository academicYearRepository) {
        this.semesterRepository = semesterRepository;
        this.academicYearRepository = academicYearRepository;
    }

    @Override
    @Transactional
    public SemesterDTO createSemester(SemesterDTO dto) {
        if (dto.getSemesterNumber() == null || dto.getSemesterNumber() < 1 || dto.getSemesterNumber() > 12) {
            throw new BusinessException("Semester number must be between 1 and 12.");
        }
        if (dto.getSemesterName() == null || dto.getSemesterName().trim().isEmpty()) {
            throw new BusinessException("Semester name cannot be empty.");
        }
        if (dto.getAcademicYearId() == null) {
            throw new BusinessException("Academic year ID is required.");
        }

        AcademicYear academicYear = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + dto.getAcademicYearId()));

        if (semesterRepository.findBySemesterNumberAndAcademicYear_AcademicYearId(dto.getSemesterNumber(), dto.getAcademicYearId()).isPresent()) {
            throw new ConflictException("Semester " + dto.getSemesterNumber() + " already exists for this academic year.");
        }

        Semester semester = new Semester();
        semester.setSemesterNumber(dto.getSemesterNumber());
        semester.setSemesterName(dto.getSemesterName().trim());
        semester.setAcademicYear(academicYear);
        semester.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        Semester saved = semesterRepository.save(semester);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SemesterDTO getSemesterById(Long id) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + id));
        return mapToDTO(semester);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SemesterDTO> getAllSemesters() {
        return semesterRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SemesterDTO updateSemester(Long id, SemesterDTO dto) {
        Semester semester = semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + id));

        if (dto.getSemesterNumber() != null && !dto.getSemesterNumber().equals(semester.getSemesterNumber())) {
            Long academicYearId = dto.getAcademicYearId() != null ? dto.getAcademicYearId() : semester.getAcademicYear().getAcademicYearId();
            if (semesterRepository.findBySemesterNumberAndAcademicYear_AcademicYearId(dto.getSemesterNumber(), academicYearId).isPresent()) {
                throw new ConflictException("Semester " + dto.getSemesterNumber() + " already exists for this academic year.");
            }
            semester.setSemesterNumber(dto.getSemesterNumber());
        }

        if (dto.getSemesterName() != null && !dto.getSemesterName().trim().isEmpty()) {
            semester.setSemesterName(dto.getSemesterName().trim());
        }

        if (dto.getAcademicYearId() != null && !dto.getAcademicYearId().equals(semester.getAcademicYear().getAcademicYearId())) {
            AcademicYear academicYear = academicYearRepository.findById(dto.getAcademicYearId())
                    .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + dto.getAcademicYearId()));
            semester.setAcademicYear(academicYear);
        }

        if (dto.getStatus() != null) {
            semester.setStatus(dto.getStatus());
        }

        Semester updated = semesterRepository.save(semester);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteSemester(Long id) {
        if (!semesterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Semester not found with ID: " + id);
        }
        semesterRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SemesterDTO> getSemestersByAcademicYear(Long academicYearId) {
        return semesterRepository.findByAcademicYear_AcademicYearId(academicYearId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private SemesterDTO mapToDTO(Semester s) {
        return new SemesterDTO(
                s.getSemesterId(),
                s.getSemesterNumber(),
                s.getSemesterName(),
                s.getAcademicYear() != null ? s.getAcademicYear().getAcademicYearId() : null,
                s.getAcademicYear() != null ? s.getAcademicYear().getAcademicYear() : null,
                s.getStatus()
        );
    }
}
