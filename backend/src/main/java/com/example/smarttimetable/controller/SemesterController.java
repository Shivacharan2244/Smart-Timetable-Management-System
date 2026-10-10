package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.SemesterDTO;
import com.example.smarttimetable.service.SemesterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    private final SemesterService semesterService;

    public SemesterController(SemesterService semesterService) {
        this.semesterService = semesterService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SemesterDTO>>> getAllSemesters() {
        List<SemesterDTO> semesters = semesterService.getAllSemesters();
        return ResponseEntity.ok(ApiResponse.success("Semesters retrieved successfully.", semesters));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SemesterDTO>> getSemesterById(@PathVariable Long id) {
        SemesterDTO semester = semesterService.getSemesterById(id);
        return ResponseEntity.ok(ApiResponse.success("Semester retrieved successfully.", semester));
    }

    @GetMapping("/academic-year/{academicYearId}")
    public ResponseEntity<ApiResponse<List<SemesterDTO>>> getSemestersByAcademicYear(
            @PathVariable Long academicYearId) {
        List<SemesterDTO> semesters = semesterService.getSemestersByAcademicYear(academicYearId);
        return ResponseEntity.ok(ApiResponse.success("Semesters for academic year retrieved successfully.", semesters));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SemesterDTO>> createSemester(@Valid @RequestBody SemesterDTO dto) {
        SemesterDTO created = semesterService.createSemester(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Semester created successfully.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SemesterDTO>> updateSemester(
            @PathVariable Long id,
            @Valid @RequestBody SemesterDTO dto) {
        SemesterDTO updated = semesterService.updateSemester(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Semester updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSemester(@PathVariable Long id) {
        semesterService.deleteSemester(id);
        return ResponseEntity.ok(ApiResponse.success("Semester deleted successfully."));
    }
}
