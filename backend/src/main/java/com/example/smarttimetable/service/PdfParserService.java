package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.PdfUploadResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface PdfParserService {
    PdfUploadResponseDTO processTimetablePdf(MultipartFile file, Long departmentId, Long academicYearId,
                                            Long semesterId, Long sectionId, String userEmail);

    PdfUploadResponseDTO processTimetablePdf(MultipartFile file, Long departmentId, String departmentName,
                                            String departmentCode, Long academicYearId, Long semesterId,
                                            Long sectionId, String userEmail);

    PdfUploadResponseDTO processTimetablePdf(MultipartFile file, Long departmentId, String departmentName,
                                            String departmentCode, Integer yearOfStudy, Long academicYearId,
                                            Long semesterId, Long sectionId, String userEmail);
}
