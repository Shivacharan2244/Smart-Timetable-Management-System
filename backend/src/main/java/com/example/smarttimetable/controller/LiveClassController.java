package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.LiveClassDTO;
import com.example.smarttimetable.service.LiveClassService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/live-classes")
public class LiveClassController {

    private final LiveClassService liveClassService;

    public LiveClassController(LiveClassService liveClassService) {
        this.liveClassService = liveClassService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LiveClassDTO>>> getAllLiveClasses() {
        List<LiveClassDTO> list = liveClassService.getAllLiveClasses();
        return ResponseEntity.ok(ApiResponse.success("Live classes retrieved successfully.", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LiveClassDTO>> getLiveClassById(@PathVariable Long id) {
        LiveClassDTO dto = liveClassService.getLiveClassById(id);
        return ResponseEntity.ok(ApiResponse.success("Live class retrieved successfully.", dto));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<LiveClassDTO>>> getTodayLiveClasses() {
        List<LiveClassDTO> list = liveClassService.getTodayLiveClasses();
        return ResponseEntity.ok(ApiResponse.success("Today's live classes retrieved successfully.", list));
    }

    @GetMapping("/running")
    public ResponseEntity<ApiResponse<List<LiveClassDTO>>> getRunningLiveClasses() {
        List<LiveClassDTO> list = liveClassService.getRunningLiveClasses();
        return ResponseEntity.ok(ApiResponse.success("Running live classes retrieved successfully.", list));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<LiveClassDTO>>> getUpcomingLiveClasses() {
        List<LiveClassDTO> list = liveClassService.getUpcomingLiveClasses();
        return ResponseEntity.ok(ApiResponse.success("Upcoming live classes retrieved successfully.", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LiveClassDTO>> createLiveClass(@Valid @RequestBody LiveClassDTO dto) {
        LiveClassDTO created = liveClassService.createLiveClass(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Live class initialized successfully.", created));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<ApiResponse<LiveClassDTO>> startClass(@PathVariable Long id) {
        LiveClassDTO dto = liveClassService.startClass(id);
        return ResponseEntity.ok(ApiResponse.success("Live class started successfully.", dto));
    }

    @PatchMapping("/{id}/end")
    public ResponseEntity<ApiResponse<LiveClassDTO>> endClass(@PathVariable Long id) {
        LiveClassDTO dto = liveClassService.endClass(id);
        return ResponseEntity.ok(ApiResponse.success("Live class ended successfully.", dto));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<LiveClassDTO>> cancelClass(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null && body.containsKey("reason") ? body.get("reason") : "Class cancelled by faculty or admin.";
        LiveClassDTO dto = liveClassService.cancelClass(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Live class cancelled successfully.", dto));
    }

    @PatchMapping("/{id}/change-room")
    public ResponseEntity<ApiResponse<LiveClassDTO>> changeRoom(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long newRoomId = Long.valueOf(body.get("newRoomId").toString());
        String reason = body.containsKey("reason") && body.get("reason") != null ? body.get("reason").toString() : "Room reassigned";
        LiveClassDTO dto = liveClassService.changeRoom(id, newRoomId, reason);
        return ResponseEntity.ok(ApiResponse.success("Class room updated successfully.", dto));
    }

    @PostMapping("/sync-today")
    public ResponseEntity<ApiResponse<List<LiveClassDTO>>> syncTodayClasses() {
        List<LiveClassDTO> list = liveClassService.syncTodayClasses();
        return ResponseEntity.ok(ApiResponse.success("Today's live classes synchronized with schedule.", list));
    }
}
