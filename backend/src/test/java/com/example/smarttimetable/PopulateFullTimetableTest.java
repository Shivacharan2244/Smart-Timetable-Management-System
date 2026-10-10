package com.example.smarttimetable;

import com.example.smarttimetable.dto.PdfUploadResponseDTO;
import com.example.smarttimetable.repository.SectionRepository;
import com.example.smarttimetable.repository.TimetableEntryRepository;
import com.example.smarttimetable.service.PdfParserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.io.File;
import java.io.FileInputStream;

@SpringBootTest
public class PopulateFullTimetableTest {

    @Autowired
    private PdfParserService pdfParserService;

    @Autowired
    private TimetableEntryRepository timetableEntryRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Test
    public void populateTimetables() throws Exception {
        File file = new File("uploads/timetables/1791278578542_III-I_AIML_Timetable_AY_2026-27-_V6.pdf");
        if (!file.exists()) {
            System.out.println("Timetable PDF not found: " + file.getAbsolutePath());
            return;
        }

        try (FileInputStream fis = new FileInputStream(file)) {
            MockMultipartFile multipartFile = new MockMultipartFile(
                    "file",
                    file.getName(),
                    "application/pdf",
                    fis
            );

            PdfUploadResponseDTO response = pdfParserService.processTimetablePdf(
                    multipartFile,
                    null, null, null, null,
                    "admin@gmail.com"
            );

            System.out.println("Upload result: status=" + response.getUploadStatus() +
                    ", saved=" + response.getExtractedCount() +
                    ", conflicts=" + response.getConflictCount() +
                    ", totalParsed=" + response.getTotalParsed());
        }

        sectionRepository.findAll().forEach(sec -> {
            long count = timetableEntryRepository.findByTimetable_Section_SectionId(sec.getSectionId()).size();
            System.out.println("Section: " + sec.getSectionName() + " -> " + count + " periods");
        });
    }
}
