package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.TimeSlotDTO;
import com.example.smarttimetable.service.TimeSlotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time-slots")
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    public TimeSlotController(TimeSlotService timeSlotService) {
        this.timeSlotService = timeSlotService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimeSlotDTO>>> getAllTimeSlots() {
        List<TimeSlotDTO> list = timeSlotService.getAllTimeSlots();
        return ResponseEntity.ok(ApiResponse.success("Time slots retrieved successfully.", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TimeSlotDTO>> getTimeSlotById(@PathVariable Long id) {
        TimeSlotDTO dto = timeSlotService.getTimeSlotById(id);
        return ResponseEntity.ok(ApiResponse.success("Time slot retrieved successfully.", dto));
    }

    @GetMapping("/day/{dayOrder}")
    public ResponseEntity<ApiResponse<List<TimeSlotDTO>>> getTimeSlotsByDayOrder(@PathVariable String dayOrder) {
        List<TimeSlotDTO> list = timeSlotService.getTimeSlotsByDayOrder(dayOrder);
        return ResponseEntity.ok(ApiResponse.success("Time slots for day order retrieved successfully.", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TimeSlotDTO>> createTimeSlot(@Valid @RequestBody TimeSlotDTO dto) {
        TimeSlotDTO created = timeSlotService.createTimeSlot(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Time slot created successfully.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TimeSlotDTO>> updateTimeSlot(
            @PathVariable Long id,
            @Valid @RequestBody TimeSlotDTO dto) {
        TimeSlotDTO updated = timeSlotService.updateTimeSlot(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Time slot updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTimeSlot(@PathVariable Long id) {
        timeSlotService.deleteTimeSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Time slot deleted successfully."));
    }
}
