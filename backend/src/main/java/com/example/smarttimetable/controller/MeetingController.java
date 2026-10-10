package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.MeetingDTO;
import com.example.smarttimetable.service.MeetingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MeetingDTO>>> getAllMeetings() {
        List<MeetingDTO> list = meetingService.getAllMeetings();
        return ResponseEntity.ok(ApiResponse.success("Meetings retrieved successfully.", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MeetingDTO>> getMeetingById(@PathVariable Long id) {
        MeetingDTO dto = meetingService.getMeetingById(id);
        return ResponseEntity.ok(ApiResponse.success("Meeting retrieved successfully.", dto));
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<ApiResponse<List<MeetingDTO>>> getMeetingsByFaculty(@PathVariable Long facultyId) {
        List<MeetingDTO> list = meetingService.getMeetingsByFaculty(facultyId);
        return ResponseEntity.ok(ApiResponse.success("Meetings for faculty retrieved successfully.", list));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<List<MeetingDTO>>> getMeetingsByRoom(@PathVariable Long roomId) {
        List<MeetingDTO> list = meetingService.getMeetingsByRoom(roomId);
        return ResponseEntity.ok(ApiResponse.success("Meetings for room retrieved successfully.", list));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<MeetingDTO>>> getMeetingsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<MeetingDTO> list = meetingService.getMeetingsByDate(date);
        return ResponseEntity.ok(ApiResponse.success("Meetings for date retrieved successfully.", list));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<MeetingDTO>>> getUpcomingMeetings() {
        List<MeetingDTO> list = meetingService.getUpcomingMeetings();
        return ResponseEntity.ok(ApiResponse.success("Upcoming meetings retrieved successfully.", list));
    }

    @GetMapping("/suggested-slots")
    public ResponseEntity<ApiResponse<List<com.example.smarttimetable.dto.SuggestedSlotDTO>>> getSuggestedSlots(
            @RequestParam Long facultyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false, defaultValue = "09:00") @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) java.time.LocalTime rangeStart,
            @RequestParam(required = false, defaultValue = "17:00") @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) java.time.LocalTime rangeEnd,
            @RequestParam(required = false, defaultValue = "30") int durationMinutes,
            @RequestParam(required = false) Long roomId) {

        List<com.example.smarttimetable.dto.SuggestedSlotDTO> slots = meetingService.getSuggestedSlots(
                facultyId, date != null ? date : LocalDate.now(), rangeStart, rangeEnd, durationMinutes, roomId);
        return ResponseEntity.ok(ApiResponse.success("Suggested available slots generated successfully.", slots));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MeetingDTO>> createMeeting(@Valid @RequestBody MeetingDTO dto) {
        MeetingDTO created = meetingService.createMeeting(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Meeting scheduled successfully.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MeetingDTO>> updateMeeting(
            @PathVariable Long id,
            @Valid @RequestBody MeetingDTO dto) {
        MeetingDTO updated = meetingService.updateMeeting(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Meeting updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMeeting(@PathVariable Long id) {
        meetingService.cancelMeeting(id);
        return ResponseEntity.ok(ApiResponse.success("Meeting cancelled successfully."));
    }
}
