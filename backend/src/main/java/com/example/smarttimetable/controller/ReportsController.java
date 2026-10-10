package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.FacultyWorkloadReportDTO;
import com.example.smarttimetable.dto.RoomUtilizationReportDTO;
import com.example.smarttimetable.service.ReportsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    private final ReportsService reportsService;

    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    @GetMapping("/faculty-workload")
    public ResponseEntity<ApiResponse<List<FacultyWorkloadReportDTO>>> getFacultyWorkloadReport() {
        List<FacultyWorkloadReportDTO> list = reportsService.getFacultyWorkloadReport();
        return ResponseEntity.ok(ApiResponse.success("Faculty workload report retrieved successfully.", list));
    }

    @GetMapping("/room-utilization")
    public ResponseEntity<ApiResponse<List<RoomUtilizationReportDTO>>> getRoomUtilizationReport() {
        List<RoomUtilizationReportDTO> list = reportsService.getRoomUtilizationReport();
        return ResponseEntity.ok(ApiResponse.success("Room utilization report retrieved successfully.", list));
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReportsOverview() {
        Map<String, Object> overview = reportsService.getReportsOverview();
        return ResponseEntity.ok(ApiResponse.success("Institutional scheduling analytics overview retrieved successfully.", overview));
    }
}
