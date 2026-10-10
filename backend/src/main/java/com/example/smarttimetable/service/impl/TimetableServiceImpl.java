package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.TimetableDTO;
import com.example.smarttimetable.entity.*;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.*;
import com.example.smarttimetable.service.TimetableService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimetableServiceImpl implements TimetableService {

    private final TimetableRepository timetableRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final SectionRepository sectionRepository;

    public TimetableServiceImpl(TimetableRepository timetableRepository,
                                DepartmentRepository departmentRepository,
                                AcademicYearRepository academicYearRepository,
                                SemesterRepository semesterRepository,
                                SectionRepository sectionRepository) {
        this.timetableRepository = timetableRepository;
        this.departmentRepository = departmentRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.sectionRepository = sectionRepository;
    }

    @Override
    @Transactional
    public TimetableDTO createTimetable(TimetableDTO dto) {
        validateTimetableDates(dto);

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));

        AcademicYear academicYear = academicYearRepository.findById(dto.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + dto.getAcademicYearId()));

        Semester semester = semesterRepository.findById(dto.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + dto.getSemesterId()));

        Section section = sectionRepository.findById(dto.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + dto.getSectionId()));

        Timetable timetable = new Timetable();
        timetable.setDepartment(department);
        timetable.setAcademicYear(academicYear);
        timetable.setSemester(semester);
        timetable.setSection(section);
        timetable.setEffectiveFrom(dto.getEffectiveFrom());
        timetable.setEffectiveTo(dto.getEffectiveTo());
        timetable.setVersionNumber(dto.getVersionNumber() != null ? dto.getVersionNumber() : 1);
        timetable.setActive(dto.getActive() != null ? dto.getActive() : true);
        timetable.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        Timetable saved = timetableRepository.save(timetable);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TimetableDTO getTimetableById(Long id) {
        Timetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable not found with ID: " + id));
        return mapToDTO(timetable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableDTO> getAllTimetables() {
        return timetableRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TimetableDTO updateTimetable(Long id, TimetableDTO dto) {
        Timetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable not found with ID: " + id));

        validateTimetableDates(dto);

        if (dto.getDepartmentId() != null && !dto.getDepartmentId().equals(timetable.getDepartment().getDepartmentId())) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));
            timetable.setDepartment(department);
        }

        if (dto.getAcademicYearId() != null && !dto.getAcademicYearId().equals(timetable.getAcademicYear().getAcademicYearId())) {
            AcademicYear academicYear = academicYearRepository.findById(dto.getAcademicYearId())
                    .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + dto.getAcademicYearId()));
            timetable.setAcademicYear(academicYear);
        }

        if (dto.getSemesterId() != null && !dto.getSemesterId().equals(timetable.getSemester().getSemesterId())) {
            Semester semester = semesterRepository.findById(dto.getSemesterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + dto.getSemesterId()));
            timetable.setSemester(semester);
        }

        if (dto.getSectionId() != null && !dto.getSectionId().equals(timetable.getSection().getSectionId())) {
            Section section = sectionRepository.findById(dto.getSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Section not found with ID: " + dto.getSectionId()));
            timetable.setSection(section);
        }

        timetable.setEffectiveFrom(dto.getEffectiveFrom());
        timetable.setEffectiveTo(dto.getEffectiveTo());

        if (dto.getVersionNumber() != null) {
            timetable.setVersionNumber(dto.getVersionNumber());
        }
        if (dto.getActive() != null) {
            timetable.setActive(dto.getActive());
        }
        if (dto.getStatus() != null) {
            timetable.setStatus(dto.getStatus());
        }

        Timetable updated = timetableRepository.save(timetable);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteTimetable(Long id) {
        if (!timetableRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Timetable not found with ID: " + id);
        }
        timetableRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableDTO> getActiveTimetables() {
        return timetableRepository.findByActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableDTO> getTimetablesByDepartment(Long departmentId) {
        return timetableRepository.findByDepartment_DepartmentId(departmentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableDTO> getTimetablesBySection(Long sectionId) {
        return timetableRepository.findBySection_SectionId(sectionId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableDTO> getTimetablesBySemester(Long semesterId) {
        return timetableRepository.findBySemester_SemesterId(semesterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private void validateTimetableDates(TimetableDTO dto) {
        if (dto.getEffectiveFrom() == null) {
            throw new BusinessException("Effective-from date is required.");
        }
        if (dto.getEffectiveTo() != null && dto.getEffectiveFrom().isAfter(dto.getEffectiveTo())) {
            throw new BusinessException("Effective-from date cannot be after effective-to date.");
        }
    }

    private TimetableDTO mapToDTO(Timetable t) {
        return new TimetableDTO(
                t.getTimetableId(),
                t.getDepartment() != null ? t.getDepartment().getDepartmentId() : null,
                t.getDepartment() != null ? t.getDepartment().getDepartmentName() : null,
                t.getAcademicYear() != null ? t.getAcademicYear().getAcademicYearId() : null,
                t.getAcademicYear() != null ? t.getAcademicYear().getAcademicYear() : null,
                t.getSemester() != null ? t.getSemester().getSemesterId() : null,
                t.getSemester() != null ? t.getSemester().getSemesterName() : null,
                t.getSection() != null ? t.getSection().getSectionId() : null,
                t.getSection() != null ? t.getSection().getSectionName() : null,
                t.getEffectiveFrom(),
                t.getEffectiveTo(),
                t.getVersionNumber(),
                t.getActive(),
                t.getStatus()
        );
    }
}
