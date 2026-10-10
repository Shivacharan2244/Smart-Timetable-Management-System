package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.FacultyWorkloadReportDTO;
import com.example.smarttimetable.dto.RoomUtilizationReportDTO;

import java.util.List;
import java.util.Map;

public interface ReportsService {
    List<FacultyWorkloadReportDTO> getFacultyWorkloadReport();
    List<RoomUtilizationReportDTO> getRoomUtilizationReport();
    Map<String, Object> getReportsOverview();
}
