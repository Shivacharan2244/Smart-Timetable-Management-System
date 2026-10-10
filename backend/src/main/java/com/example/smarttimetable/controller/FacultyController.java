package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.FacultyDTO;
import com.example.smarttimetable.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculties")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FacultyDTO>>> getAllFaculties() {
        List<FacultyDTO> list = facultyService.getAllFaculties();
        return ResponseEntity.ok(ApiResponse.success("Faculties retrieved successfully.", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyDTO>> getFacultyById(@PathVariable Long id) {
        FacultyDTO dto = facultyService.getFacultyById(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty retrieved successfully.", dto));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<FacultyDTO>>> getActiveFaculties() {
        List<FacultyDTO> list = facultyService.getActiveFaculties();
        return ResponseEntity.ok(ApiResponse.success("Active faculties retrieved successfully.", list));
    }

    @GetMapping("/code/{facultyCode}")
    public ResponseEntity<ApiResponse<FacultyDTO>> getFacultyByCode(@PathVariable String facultyCode) {
        FacultyDTO dto = facultyService.getFacultyByCode(facultyCode);
        return ResponseEntity.ok(ApiResponse.success("Faculty retrieved successfully.", dto));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<FacultyDTO>>> getFacultiesByDepartment(@PathVariable Long departmentId) {
        List<FacultyDTO> list = facultyService.getFacultiesByDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success("Faculties for department retrieved successfully.", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FacultyDTO>> createFaculty(@Valid @RequestBody FacultyDTO dto) {
        FacultyDTO created = facultyService.createFaculty(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Faculty created successfully.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyDTO>> updateFaculty(
            @PathVariable Long id,
            @Valid @RequestBody FacultyDTO dto) {
        FacultyDTO updated = facultyService.updateFaculty(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Faculty updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty deleted successfully."));
    }
}
