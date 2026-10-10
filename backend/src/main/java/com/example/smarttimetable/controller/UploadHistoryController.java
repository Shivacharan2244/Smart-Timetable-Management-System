package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.PdfUploadResponseDTO;
import com.example.smarttimetable.dto.TimetableEntryDTO;
import com.example.smarttimetable.dto.UploadHistoryDTO;
import com.example.smarttimetable.entity.TimetableEntry;
import com.example.smarttimetable.repository.TimetableEntryRepository;
import com.example.smarttimetable.service.PdfParserService;
import com.example.smarttimetable.service.UploadHistoryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/upload-history")
public class UploadHistoryController {

    private final UploadHistoryService uploadHistoryService;
    private final PdfParserService pdfParserService;
    private final TimetableEntryRepository timetableEntryRepository;

    public UploadHistoryController(UploadHistoryService uploadHistoryService,
                                   PdfParserService pdfParserService,
                                   TimetableEntryRepository timetableEntryRepository) {
        this.uploadHistoryService = uploadHistoryService;
        this.pdfParserService = pdfParserService;
        this.timetableEntryRepository = timetableEntryRepository;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PdfUploadResponseDTO>> uploadTimetablePdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "departmentName", required = false) String departmentName,
            @RequestParam(value = "departmentCode", required = false) String departmentCode,
            @RequestParam(value = "yearOfStudy", required = false) Integer yearOfStudy,
            @RequestParam(value = "academicYearId", required = false) Long academicYearId,
            @RequestParam(value = "semesterId", required = false) Long semesterId,
            @RequestParam(value = "sectionId", required = false) Long sectionId,
            Authentication authentication) {

        String userEmail = authentication != null ? authentication.getName() : null;
        PdfUploadResponseDTO response = pdfParserService.processTimetablePdf(
                file, departmentId, departmentName, departmentCode, yearOfStudy, academicYearId, semesterId, sectionId, userEmail);

        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UploadHistoryDTO>>> getAllUploadHistories() {
        List<UploadHistoryDTO> list = uploadHistoryService.getAllUploadHistories();
        return ResponseEntity.ok(ApiResponse.success("Upload histories retrieved successfully.", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UploadHistoryDTO>> getUploadHistoryById(@PathVariable Long id) {
        UploadHistoryDTO dto = uploadHistoryService.getUploadHistoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Upload history retrieved successfully.", dto));
    }

    @GetMapping("/{id}/entries")
    public ResponseEntity<ApiResponse<List<TimetableEntryDTO>>> getEntriesByUploadId(@PathVariable Long id) {
        List<TimetableEntry> entries = timetableEntryRepository.findByUploadHistory_UploadId(id);
        List<TimetableEntryDTO> dtos = entries.stream().map(te -> {
            TimetableEntryDTO dto = new TimetableEntryDTO();
            dto.setEntryId(te.getEntryId());
            dto.setTimetableId(te.getTimetable() != null ? te.getTimetable().getTimetableId() : null);
            dto.setDayOfWeek(te.getDayOfWeek());
            if (te.getTimeSlot() != null) {
                dto.setTimeSlotId(te.getTimeSlot().getTimeSlotId());
                dto.setPeriodNumber(te.getTimeSlot().getPeriodNumber());
                dto.setStartTime(te.getTimeSlot().getStartTime());
                dto.setEndTime(te.getTimeSlot().getEndTime());
            }
            if (te.getSubject() != null) {
                dto.setSubjectId(te.getSubject().getSubjectId());
                dto.setSubjectName(te.getSubject().getSubjectName());
                dto.setSubjectCode(te.getSubject().getSubjectCode());
            }
            if (te.getFaculty() != null) {
                dto.setFacultyId(te.getFaculty().getFacultyId());
                dto.setFacultyName(te.getFaculty().getFacultyName());
                dto.setFacultyCode(te.getFaculty().getFacultyCode());
            }
            if (te.getRoom() != null) {
                dto.setRoomId(te.getRoom().getRoomId());
                dto.setRoomNumber(te.getRoom().getRoomNumber());
                dto.setRoomName(te.getRoom().getRoomName());
            }
            if (te.getTimetable() != null) {
                if (te.getTimetable().getDepartment() != null) {
                    dto.setDepartmentId(te.getTimetable().getDepartment().getDepartmentId());
                    dto.setDepartmentName(te.getTimetable().getDepartment().getDepartmentName());
                    dto.setDepartmentCode(te.getTimetable().getDepartment().getDepartmentCode());
                }
                if (te.getTimetable().getSection() != null) {
                    dto.setSectionId(te.getTimetable().getSection().getSectionId());
                    dto.setSectionName(te.getTimetable().getSection().getSectionName());
                }
                if (te.getTimetable().getSemester() != null) {
                    dto.setSemesterId(te.getTimetable().getSemester().getSemesterId());
                    dto.setSemesterName(te.getTimetable().getSemester().getSemesterName());
                    Integer semNum = te.getTimetable().getSemester().getSemesterNumber();
                    dto.setSemesterNumber(semNum);
                    if (semNum != null) {
                        int yr = (semNum + 1) / 2;
                        dto.setYearOfStudy(yr);
                        dto.setYearName(yr == 1 ? "1st Year" : (yr == 2 ? "2nd Year" : (yr == 3 ? "3rd Year" : yr + "th Year")));
                    }
                }
                if (te.getTimetable().getAcademicYear() != null) {
                    dto.setAcademicYearId(te.getTimetable().getAcademicYear().getAcademicYearId());
                    dto.setAcademicYear(te.getTimetable().getAcademicYear().getAcademicYear());
                }
            }
            dto.setStatus(te.getStatus());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Uploaded timetable entries retrieved successfully.", dtos));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<UploadHistoryDTO>>> getRecentUploads() {
        List<UploadHistoryDTO> list = uploadHistoryService.getNewestUploads();
        return ResponseEntity.ok(ApiResponse.success("Recent upload histories retrieved successfully.", list));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUploadHistory(@PathVariable Long id) {
        uploadHistoryService.deleteUploadHistory(id);
        return ResponseEntity.ok(ApiResponse.success("Upload history and associated entries deleted successfully."));
    }
}
