package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.SubjectDTO;
import com.example.smarttimetable.entity.Department;
import com.example.smarttimetable.entity.Semester;
import com.example.smarttimetable.entity.Subject;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ConflictException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.DepartmentRepository;
import com.example.smarttimetable.repository.SemesterRepository;
import com.example.smarttimetable.repository.SubjectRepository;
import com.example.smarttimetable.service.SubjectService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;
    private final SemesterRepository semesterRepository;

    public SubjectServiceImpl(SubjectRepository subjectRepository,
                              DepartmentRepository departmentRepository,
                              SemesterRepository semesterRepository) {
        this.subjectRepository = subjectRepository;
        this.departmentRepository = departmentRepository;
        this.semesterRepository = semesterRepository;
    }

    @Override
    @Transactional
    public SubjectDTO createSubject(SubjectDTO dto) {
        if (dto.getSubjectName() == null || dto.getSubjectName().trim().isEmpty()) {
            throw new BusinessException("Subject name cannot be empty.");
        }
        if (dto.getSubjectCode() == null || dto.getSubjectCode().trim().isEmpty()) {
            throw new BusinessException("Subject code cannot be empty.");
        }
        if (dto.getDepartmentId() == null) {
            throw new BusinessException("Department ID is required.");
        }
        if (dto.getSemesterId() == null) {
            throw new BusinessException("Semester ID is required.");
        }

        if (subjectRepository.existsBySubjectCode(dto.getSubjectCode().trim().toUpperCase())) {
            throw new ConflictException("Subject code already exists: " + dto.getSubjectCode());
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));

        Semester semester = semesterRepository.findById(dto.getSemesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + dto.getSemesterId()));

        Subject subject = new Subject();
        subject.setSubjectName(dto.getSubjectName().trim());
        subject.setSubjectCode(dto.getSubjectCode().trim().toUpperCase());
        subject.setDepartment(department);
        subject.setSemester(semester);
        subject.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        Subject saved = subjectRepository.save(subject);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SubjectDTO getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));
        return mapToDTO(subject);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SubjectDTO updateSubject(Long id, SubjectDTO dto) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + id));

        if (dto.getSubjectCode() != null && !dto.getSubjectCode().equalsIgnoreCase(subject.getSubjectCode())) {
            if (subjectRepository.existsBySubjectCode(dto.getSubjectCode().trim().toUpperCase())) {
                throw new ConflictException("Subject code already in use: " + dto.getSubjectCode());
            }
            subject.setSubjectCode(dto.getSubjectCode().trim().toUpperCase());
        }

        if (dto.getSubjectName() != null && !dto.getSubjectName().trim().isEmpty()) {
            subject.setSubjectName(dto.getSubjectName().trim());
        }

        if (dto.getDepartmentId() != null && !dto.getDepartmentId().equals(subject.getDepartment().getDepartmentId())) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));
            subject.setDepartment(department);
        }

        if (dto.getSemesterId() != null && !dto.getSemesterId().equals(subject.getSemester().getSemesterId())) {
            Semester semester = semesterRepository.findById(dto.getSemesterId())
                    .orElseThrow(() -> new ResourceNotFoundException("Semester not found with ID: " + dto.getSemesterId()));
            subject.setSemester(semester);
        }

        if (dto.getStatus() != null) {
            subject.setStatus(dto.getStatus());
        }

        Subject updated = subjectRepository.save(subject);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Subject not found with ID: " + id);
        }
        subjectRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public SubjectDTO getSubjectByCode(String code) {
        Subject subject = subjectRepository.findBySubjectCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with code: " + code));
        return mapToDTO(subject);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectDTO> getSubjectsByDepartment(Long departmentId) {
        return subjectRepository.findByDepartment_DepartmentId(departmentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectDTO> getSubjectsBySemester(Long semesterId) {
        return subjectRepository.findBySemester_SemesterId(semesterId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private SubjectDTO mapToDTO(Subject s) {
        SubjectDTO dto = new SubjectDTO(
                s.getSubjectId(),
                s.getSubjectName(),
                s.getSubjectCode(),
                s.getDepartment() != null ? s.getDepartment().getDepartmentId() : null,
                s.getDepartment() != null ? s.getDepartment().getDepartmentName() : null,
                s.getSemester() != null ? s.getSemester().getSemesterId() : null,
                s.getSemester() != null ? s.getSemester().getSemesterName() : null,
                s.getStatus()
        );
        if (s.getDepartment() != null) {
            dto.setDepartmentCode(s.getDepartment().getDepartmentCode());
        }
        return dto;
    }
}
