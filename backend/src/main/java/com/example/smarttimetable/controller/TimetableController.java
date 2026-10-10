package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.TimetableDTO;
import com.example.smarttimetable.service.TimetableService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetables")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimetableDTO>>> getAllTimetables() {
        List<TimetableDTO> list = timetableService.getAllTimetables();
        return ResponseEntity.ok(ApiResponse.success("Timetables retrieved successfully.", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TimetableDTO>> getTimetableById(@PathVariable Long id) {
        TimetableDTO dto = timetableService.getTimetableById(id);
        return ResponseEntity.ok(ApiResponse.success("Timetable retrieved successfully.", dto));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<TimetableDTO>>> getActiveTimetables() {
        List<TimetableDTO> list = timetableService.getActiveTimetables();
        return ResponseEntity.ok(ApiResponse.success("Active timetables retrieved successfully.", list));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<TimetableDTO>>> getTimetablesByDepartment(@PathVariable Long departmentId) {
        List<TimetableDTO> list = timetableService.getTimetablesByDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success("Timetables for department retrieved successfully.", list));
    }

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<ApiResponse<List<TimetableDTO>>> getTimetablesBySection(@PathVariable Long sectionId) {
        List<TimetableDTO> list = timetableService.getTimetablesBySection(sectionId);
        return ResponseEntity.ok(ApiResponse.success("Timetables for section retrieved successfully.", list));
    }

    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<ApiResponse<List<TimetableDTO>>> getTimetablesBySemester(@PathVariable Long semesterId) {
        List<TimetableDTO> list = timetableService.getTimetablesBySemester(semesterId);
        return ResponseEntity.ok(ApiResponse.success("Timetables for semester retrieved successfully.", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TimetableDTO>> createTimetable(@Valid @RequestBody TimetableDTO dto) {
        TimetableDTO created = timetableService.createTimetable(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Timetable created successfully.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TimetableDTO>> updateTimetable(
            @PathVariable Long id,
            @Valid @RequestBody TimetableDTO dto) {
        TimetableDTO updated = timetableService.updateTimetable(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Timetable updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTimetable(@PathVariable Long id) {
        timetableService.deleteTimetable(id);
        return ResponseEntity.ok(ApiResponse.success("Timetable deleted successfully."));
    }
}
