package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.AcademicYearDTO;
import com.example.smarttimetable.entity.AcademicYear;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ConflictException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.AcademicYearRepository;
import com.example.smarttimetable.service.AcademicYearService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AcademicYearServiceImpl implements AcademicYearService {

    private final AcademicYearRepository academicYearRepository;

    public AcademicYearServiceImpl(AcademicYearRepository academicYearRepository) {
        this.academicYearRepository = academicYearRepository;
    }

    @Override
    @Transactional
    public AcademicYearDTO createAcademicYear(AcademicYearDTO dto) {
        validateDates(dto);

        if (academicYearRepository.existsByAcademicYear(dto.getAcademicYear().trim())) {
            throw new ConflictException("Academic year already exists: " + dto.getAcademicYear());
        }

        AcademicYear academicYear = new AcademicYear();
        academicYear.setAcademicYear(dto.getAcademicYear().trim());
        academicYear.setStartDate(dto.getStartDate());
        academicYear.setEndDate(dto.getEndDate());
        academicYear.setActive(dto.getActive() != null ? dto.getActive() : false);
        academicYear.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        // If this one is set as active, deactivate other years
        if (Boolean.TRUE.equals(academicYear.getActive())) {
            deactivateOtherYears(null);
        }

        AcademicYear saved = academicYearRepository.save(academicYear);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicYearDTO getAcademicYearById(Long id) {
        AcademicYear academicYear = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + id));
        return mapToDTO(academicYear);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicYearDTO> getAllAcademicYears() {
        return academicYearRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AcademicYearDTO updateAcademicYear(Long id, AcademicYearDTO dto) {
        AcademicYear academicYear = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + id));

        validateDates(dto);

        if (dto.getAcademicYear() != null && !dto.getAcademicYear().equalsIgnoreCase(academicYear.getAcademicYear())) {
            if (academicYearRepository.existsByAcademicYear(dto.getAcademicYear().trim())) {
                throw new ConflictException("Academic year name already in use: " + dto.getAcademicYear());
            }
            academicYear.setAcademicYear(dto.getAcademicYear().trim());
        }

        academicYear.setStartDate(dto.getStartDate());
        academicYear.setEndDate(dto.getEndDate());
        if (dto.getStatus() != null) {
            academicYear.setStatus(dto.getStatus());
        }

        if (Boolean.TRUE.equals(dto.getActive())) {
            deactivateOtherYears(id);
            academicYear.setActive(true);
        } else if (dto.getActive() != null) {
            academicYear.setActive(dto.getActive());
        }

        AcademicYear updated = academicYearRepository.save(academicYear);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteAcademicYear(Long id) {
        if (!academicYearRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Academic year not found with ID: " + id);
        }
        academicYearRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicYearDTO> getActiveAcademicYears() {
        return academicYearRepository.findByActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AcademicYearDTO activateAcademicYear(Long id) {
        AcademicYear academicYear = academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found with ID: " + id));

        deactivateOtherYears(id);
        academicYear.setActive(true);
        academicYear.setStatus("ACTIVE");

        AcademicYear saved = academicYearRepository.save(academicYear);
        return mapToDTO(saved);
    }

    private void deactivateOtherYears(Long currentId) {
        List<AcademicYear> allYears = academicYearRepository.findAll();
        for (AcademicYear ay : allYears) {
            if (currentId == null || !ay.getAcademicYearId().equals(currentId)) {
                ay.setActive(false);
                academicYearRepository.save(ay);
            }
        }
    }

    private void validateDates(AcademicYearDTO dto) {
        if (dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new BusinessException("Start date and end date are both required.");
        }
        if (!dto.getStartDate().isBefore(dto.getEndDate())) {
            throw new BusinessException("Start date must be strictly before end date.");
        }
    }

    private AcademicYearDTO mapToDTO(AcademicYear ay) {
        return new AcademicYearDTO(
                ay.getAcademicYearId(),
                ay.getAcademicYear(),
                ay.getStartDate(),
                ay.getEndDate(),
                ay.getActive(),
                ay.getStatus()
        );
    }
}
