package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.FacultyDTO;
import com.example.smarttimetable.service.FacultyService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/faculty")
public class FacultyAvailabilityController {

    private final FacultyService facultyService;

    public FacultyAvailabilityController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping("/free")
    public ResponseEntity<ApiResponse<List<FacultyDTO>>> getFreeFaculty(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String day,
            @RequestParam Long timeSlotId,
            @RequestParam Long departmentId,
            @RequestParam(required = false) Long subjectId) {

        List<FacultyDTO> availableFaculties = facultyService.getFreeFaculty(date, day, timeSlotId, departmentId, subjectId);
        return ResponseEntity.ok(ApiResponse.success("Available faculties retrieved successfully.", availableFaculties));
    }

    @GetMapping("/matrix")
    public ResponseEntity<ApiResponse<List<com.example.smarttimetable.dto.FacultyMatrixDTO>>> getFacultyMatrix(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String day,
            @RequestParam(required = false) Long timeSlotId,
            @RequestParam(required = false) Long departmentId) {

        List<com.example.smarttimetable.dto.FacultyMatrixDTO> matrix = facultyService.getFacultyMatrix(date, day, timeSlotId, departmentId);
        return ResponseEntity.ok(ApiResponse.success("Faculty status matrix retrieved successfully.", matrix));
    }
}
