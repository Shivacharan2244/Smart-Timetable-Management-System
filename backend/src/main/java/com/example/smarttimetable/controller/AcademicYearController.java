package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.AcademicYearDTO;
import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.service.AcademicYearService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic-years")
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    public AcademicYearController(AcademicYearService academicYearService) {
        this.academicYearService = academicYearService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AcademicYearDTO>>> getAllAcademicYears() {
        List<AcademicYearDTO> list = academicYearService.getAllAcademicYears();
        return ResponseEntity.ok(ApiResponse.success("Academic years retrieved successfully.", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicYearDTO>> getAcademicYearById(@PathVariable Long id) {
        AcademicYearDTO dto = academicYearService.getAcademicYearById(id);
        return ResponseEntity.ok(ApiResponse.success("Academic year retrieved successfully.", dto));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<AcademicYearDTO>>> getActiveAcademicYears() {
        List<AcademicYearDTO> activeList = academicYearService.getActiveAcademicYears();
        return ResponseEntity.ok(ApiResponse.success("Active academic years retrieved successfully.", activeList));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AcademicYearDTO>> createAcademicYear(@Valid @RequestBody AcademicYearDTO dto) {
        AcademicYearDTO created = academicYearService.createAcademicYear(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Academic year created successfully.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicYearDTO>> updateAcademicYear(
            @PathVariable Long id,
            @Valid @RequestBody AcademicYearDTO dto) {
        AcademicYearDTO updated = academicYearService.updateAcademicYear(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Academic year updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAcademicYear(@PathVariable Long id) {
        academicYearService.deleteAcademicYear(id);
        return ResponseEntity.ok(ApiResponse.success("Academic year deleted successfully."));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<AcademicYearDTO>> activateAcademicYear(@PathVariable Long id) {
        AcademicYearDTO activated = academicYearService.activateAcademicYear(id);
        return ResponseEntity.ok(ApiResponse.success("Academic year activated successfully.", activated));
    }
}
