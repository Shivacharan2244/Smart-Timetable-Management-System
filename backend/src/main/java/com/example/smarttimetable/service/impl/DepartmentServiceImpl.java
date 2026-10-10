package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.DepartmentDTO;
import com.example.smarttimetable.entity.Department;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ConflictException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.DepartmentRepository;
import com.example.smarttimetable.repository.FacultyRepository;
import com.example.smarttimetable.repository.SectionRepository;
import com.example.smarttimetable.repository.SubjectRepository;
import com.example.smarttimetable.service.DepartmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository,
                                 FacultyRepository facultyRepository,
                                 SubjectRepository subjectRepository,
                                 SectionRepository sectionRepository) {
        this.departmentRepository = departmentRepository;
        this.facultyRepository = facultyRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
    }

    @Override
    @Transactional
    public DepartmentDTO createDepartment(DepartmentDTO departmentDTO) {
        if (departmentDTO.getDepartmentCode() == null || departmentDTO.getDepartmentCode().trim().isEmpty()) {
            throw new BusinessException("Department code cannot be empty.");
        }
        if (departmentDTO.getDepartmentName() == null || departmentDTO.getDepartmentName().trim().isEmpty()) {
            throw new BusinessException("Department name cannot be empty.");
        }
        if (departmentRepository.existsByDepartmentCode(departmentDTO.getDepartmentCode())) {
            throw new ConflictException("Department code already exists: " + departmentDTO.getDepartmentCode());
        }

        Department department = new Department();
        department.setDepartmentName(departmentDTO.getDepartmentName().trim());
        department.setDepartmentCode(departmentDTO.getDepartmentCode().trim().toUpperCase());
        department.setStatus(departmentDTO.getStatus() != null ? departmentDTO.getStatus() : "ACTIVE");

        Department saved = departmentRepository.save(department);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentDTO getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));
        return mapToDTO(department);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + id));

        if (departmentDTO.getDepartmentCode() != null && !departmentDTO.getDepartmentCode().equalsIgnoreCase(department.getDepartmentCode())) {
            if (departmentRepository.existsByDepartmentCode(departmentDTO.getDepartmentCode())) {
                throw new ConflictException("Department code already in use: " + departmentDTO.getDepartmentCode());
            }
            department.setDepartmentCode(departmentDTO.getDepartmentCode().trim().toUpperCase());
        }

        if (departmentDTO.getDepartmentName() != null && !departmentDTO.getDepartmentName().trim().isEmpty()) {
            department.setDepartmentName(departmentDTO.getDepartmentName().trim());
        }
        if (departmentDTO.getStatus() != null) {
            department.setStatus(departmentDTO.getStatus());
        }

        Department updated = departmentRepository.save(department);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Department not found with ID: " + id);
        }

        // Safe relational check
        if (!facultyRepository.findByDepartment_DepartmentId(id).isEmpty()) {
            throw new ConflictException("Cannot delete department because faculty members are assigned to it.");
        }
        if (!subjectRepository.findByDepartment_DepartmentId(id).isEmpty()) {
            throw new ConflictException("Cannot delete department because subjects are associated with it.");
        }
        if (!sectionRepository.findByDepartment_DepartmentId(id).isEmpty()) {
            throw new ConflictException("Cannot delete department because sections are associated with it.");
        }

        departmentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentDTO getDepartmentByCode(String code) {
        Department department = departmentRepository.findByDepartmentCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with code: " + code));
        return mapToDTO(department);
    }

    private DepartmentDTO mapToDTO(Department dept) {
        return new DepartmentDTO(
                dept.getDepartmentId(),
                dept.getDepartmentName(),
                dept.getDepartmentCode(),
                dept.getStatus()
        );
    }
}
