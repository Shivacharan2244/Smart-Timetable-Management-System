package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.SectionDTO;
import com.example.smarttimetable.service.SectionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
public class SectionController {

    private final SectionService sectionService;

    public SectionController(SectionService sectionService) {
        this.sectionService = sectionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SectionDTO>>> getAllSections() {
        List<SectionDTO> sections = sectionService.getAllSections();
        return ResponseEntity.ok(ApiResponse.success("Sections retrieved successfully.", sections));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SectionDTO>> getSectionById(@PathVariable Long id) {
        SectionDTO section = sectionService.getSectionById(id);
        return ResponseEntity.ok(ApiResponse.success("Section retrieved successfully.", section));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<SectionDTO>>> getSectionsByDepartment(
            @PathVariable Long departmentId) {
        List<SectionDTO> sections = sectionService.getSectionsByDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success("Sections for department retrieved successfully.", sections));
    }

    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<ApiResponse<List<SectionDTO>>> getSectionsBySemester(
            @PathVariable Long semesterId) {
        List<SectionDTO> sections = sectionService.getSectionsBySemester(semesterId);
        return ResponseEntity.ok(ApiResponse.success("Sections for semester retrieved successfully.", sections));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SectionDTO>> createSection(@Valid @RequestBody SectionDTO dto) {
        SectionDTO created = sectionService.createSection(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Section created successfully.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SectionDTO>> updateSection(
            @PathVariable Long id,
            @Valid @RequestBody SectionDTO dto) {
        SectionDTO updated = sectionService.updateSection(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Section updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSection(@PathVariable Long id) {
        sectionService.deleteSection(id);
        return ResponseEntity.ok(ApiResponse.success("Section deleted successfully."));
    }
}
