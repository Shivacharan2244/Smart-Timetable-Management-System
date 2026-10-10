package com.example.smarttimetable;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.Test;

import java.io.File;

public class GenerateSamplePdfTest {

    @Test
    public void generateSampleTimetablePdf() throws Exception {
        File dir = new File("scratch");
        if (!dir.exists()) dir.mkdirs();

        PDDocument doc = new PDDocument();
        PDPage page = new PDPage();
        doc.addPage(page);

        PDPageContentStream stream = new PDPageContentStream(doc, page);
        stream.beginText();
        stream.setFont(PDType1Font.HELVETICA_BOLD, 14);
        stream.newLineAtOffset(50, 750);
        stream.showText("SMART TIMETABLE MANAGEMENT SYSTEM - MASTER SCHEDULE");

        stream.setFont(PDType1Font.HELVETICA_BOLD, 10);
        stream.newLineAtOffset(0, -30);
        stream.showText("Department: Artificial Intelligence and Machine Learning | Academic Year: 2025-2026 | Section: AIML - A");

        stream.setFont(PDType1Font.HELVETICA, 10);
        stream.newLineAtOffset(0, -25);
        stream.showText("MONDAY | 1 | 09:00 - 10:00 | CS501 | Software Engineering | FAC-TUR-01 | Dr. Alan Turing | 101 | Section A");

        stream.newLineAtOffset(0, -18);
        stream.showText("MONDAY | 2 | 10:00 - 11:00 | CS301 | Database Systems | FAC-TUR-01 | Dr. Alan Turing | 102 | Section A");

        stream.newLineAtOffset(0, -18);
        stream.showText("TUESDAY | 1 | 09:00 - 10:00 | AIML301 | Artificial Intelligence | FAC-02 | Dr. Ada Lovelace | 101 | Section A");

        stream.newLineAtOffset(0, -18);
        stream.showText("WEDNESDAY | 3 | 11:00 - 12:00 | CS501 | Software Engineering | FAC-TUR-01 | Dr. Alan Turing | 101 | Section A");

        stream.newLineAtOffset(0, -18);
        stream.showText("THURSDAY | 2 | 10:00 - 11:00 | CS301 | Database Systems | FAC-02 | Dr. Ada Lovelace | 102 | Section A");

        stream.newLineAtOffset(0, -18);
        stream.showText("FRIDAY | 1 | 09:00 - 10:00 | AIML301 | Artificial Intelligence | FAC-TUR-01 | Dr. Alan Turing | 101 | Section A");

        stream.newLineAtOffset(0, -18);
        stream.showText("SATURDAY | 4 | 12:00 - 13:00 | CS301 | Database Systems | FAC-02 | Dr. Ada Lovelace | 101 | Section A");

        stream.endText();
        stream.close();

        File outputFile = new File("scratch/sample_college_timetable.pdf");
        doc.save(outputFile);
        doc.close();

        System.out.println("Sample timetable PDF generated successfully at: " + outputFile.getAbsolutePath());
    }
}
