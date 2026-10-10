package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.TimetableEntryDTO;
import com.example.smarttimetable.service.TimetableEntryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable-entries")
public class TimetableEntryController {

    private final TimetableEntryService timetableEntryService;

    public TimetableEntryController(TimetableEntryService timetableEntryService) {
        this.timetableEntryService = timetableEntryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getAllEntries() {
        List<TimetableEntryDTO> list = timetableEntryService.getAllEntries();
        return ResponseEntity.ok(ApiResponse.success("Timetable entries retrieved successfully.", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TimetableEntryDTO>> getEntryById(@PathVariable Long id) {
        TimetableEntryDTO dto = timetableEntryService.getEntryById(id);
        return ResponseEntity.ok(ApiResponse.success("Timetable entry retrieved successfully.", dto));
    }

    @GetMapping("/timetable/{timetableId}")
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getEntriesByTimetable(@PathVariable Long timetableId) {
        List<TimetableEntryDTO> list = timetableEntryService.getEntriesByTimetable(timetableId);
        return ResponseEntity.ok(ApiResponse.success("Entries for timetable retrieved successfully.", list));
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getEntriesByFaculty(
            @PathVariable Long facultyId,
            @RequestParam(required = false) String dayOfWeek) {
        List<TimetableEntryDTO> list;
        if (dayOfWeek != null && !dayOfWeek.isBlank()) {
            list = timetableEntryService.getEntriesByFacultyAndDay(facultyId, dayOfWeek);
        } else {
            list = timetableEntryService.getEntriesByFaculty(facultyId);
        }
        return ResponseEntity.ok(ApiResponse.success("Entries for faculty retrieved successfully.", list));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getEntriesByRoom(
            @PathVariable Long roomId,
            @RequestParam(required = false) String dayOfWeek) {
        List<TimetableEntryDTO> list;
        if (dayOfWeek != null && !dayOfWeek.isBlank()) {
            list = timetableEntryService.getEntriesByRoom(roomId, dayOfWeek);
        } else {
            list = timetableEntryService.getEntriesByRoom(roomId);
        }
        return ResponseEntity.ok(ApiResponse.success("Entries for room retrieved successfully.", list));
    }

    @GetMapping("/section/{sectionId}")
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getEntriesBySection(
            @PathVariable Long sectionId,
            @RequestParam(required = false) String dayOfWeek) {
        List<TimetableEntryDTO> list;
        if (dayOfWeek != null && !dayOfWeek.isBlank()) {
            list = timetableEntryService.getEntriesBySection(sectionId, dayOfWeek);
        } else {
            list = timetableEntryService.getEntriesBySection(sectionId);
        }
        return ResponseEntity.ok(ApiResponse.success("Entries for section retrieved successfully.", list));
    }

    @GetMapping("/day/{dayOfWeek}")
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getEntriesByDay(@PathVariable String dayOfWeek) {
        List<TimetableEntryDTO> list = timetableEntryService.getEntriesByDay(dayOfWeek);
        return ResponseEntity.ok(ApiResponse.success("Entries for day retrieved successfully.", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TimetableEntryDTO>> createEntry(@Valid @RequestBody TimetableEntryDTO dto) {
        TimetableEntryDTO created = timetableEntryService.createEntry(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Timetable entry created successfully.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TimetableEntryDTO>> updateEntry(
            @PathVariable Long id,
            @Valid @RequestBody TimetableEntryDTO dto) {
        TimetableEntryDTO updated = timetableEntryService.updateEntry(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Timetable entry updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEntry(@PathVariable Long id) {
        timetableEntryService.deleteEntry(id);
        return ResponseEntity.ok(ApiResponse.success("Timetable entry deleted successfully."));
    }
}
