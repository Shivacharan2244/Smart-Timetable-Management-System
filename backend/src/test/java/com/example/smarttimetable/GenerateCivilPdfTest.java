package com.example.smarttimetable;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.Test;

import java.io.File;

public class GenerateCivilPdfTest {

    @Test
    public void generateCivilTimetablePdf() throws Exception {
        File dir = new File("scratch");
        if (!dir.exists()) dir.mkdirs();

        PDDocument doc = new PDDocument();

        // Page 1: CIVIL - A
        PDPage page1 = new PDPage();
        doc.addPage(page1);

        PDPageContentStream stream1 = new PDPageContentStream(doc, page1);
        stream1.beginText();
        stream1.setFont(PDType1Font.HELVETICA_BOLD, 12);
        stream1.newLineAtOffset(50, 750);
        stream1.showText("TIME TABLE");

        stream1.setFont(PDType1Font.HELVETICA, 10);
        stream1.newLineAtOffset(0, -20);
        stream1.showText("Year & Sem: B. Tech III Year I Sem  A.Y: 2026 - 2027  Regulation: R24");

        stream1.setFont(PDType1Font.HELVETICA_BOLD, 10);
        stream1.newLineAtOffset(0, -20);
        stream1.showText("Branch & Section: CIVIL - A              Room No: CE-101");

        stream1.setFont(PDType1Font.HELVETICA, 10);
        stream1.newLineAtOffset(0, -20);
        stream1.showText("Name of the Class In-charge: Dr. P. K. Rao  w.e.f: 29th June 2026");

        stream1.newLineAtOffset(0, -25);
        stream1.showText("MON SURVEYING SOM FM CONCRETE COUN SURVEY LAB(CE-L1)");

        stream1.newLineAtOffset(0, -20);
        stream1.showText("TUES TECHNICAL TRAINING(CE-101) TECHNICAL TRAINING(CE-101)");

        stream1.newLineAtOffset(0, -20);
        stream1.showText("WED SOM FM SURVEYING CONCRETE LIB FM LAB(CE-L2)");

        stream1.newLineAtOffset(0, -20);
        stream1.showText("THU FM CONCRETE SOM SURVEYING COUN");

        stream1.newLineAtOffset(0, -20);
        stream1.showText("FRI CONCRETE SURVEYING FM SOM LIB");

        stream1.newLineAtOffset(0, -20);
        stream1.showText("SAT NSO / NSS / OUTREACH / CLUB ACTIVITIES SPORTS");

        stream1.setFont(PDType1Font.HELVETICA_BOLD, 10);
        stream1.newLineAtOffset(0, -35);
        stream1.showText("Category Course Code Name of the Subject Credits Lectures Faculty");

        stream1.setFont(PDType1Font.HELVETICA, 9);
        stream1.newLineAtOffset(0, -18);
        stream1.showText("PC CE3101 Surveying and Geomatics (SURVEYING) 3 4 Dr. P. K. Rao");

        stream1.newLineAtOffset(0, -16);
        stream1.showText("PC CE3102 Strength of Materials (SOM) 3 4 Prof. A. Reddy");

        stream1.newLineAtOffset(0, -16);
        stream1.showText("PC CE3103 Fluid Mechanics (FM) 3 4 Ms. V. Sravani");

        stream1.newLineAtOffset(0, -16);
        stream1.showText("PC CE3104 Concrete Technology (CONCRETE) 3 4 Dr. N. Kumar");

        stream1.newLineAtOffset(0, -16);
        stream1.showText("PC-Lab CE3105 Surveying Lab (SURVEY LAB) 1 3 Dr. P. K. Rao");

        stream1.newLineAtOffset(0, -16);
        stream1.showText("PC-Lab CE3106 Fluid Mechanics Lab (FM LAB) 1 3 Ms. V. Sravani");

        stream1.newLineAtOffset(0, -30);
        stream1.showText("Class In-charge   Academic Coordinator   HoD - Civil Engineering   Dean- SoE");

        stream1.endText();
        stream1.close();

        File outputFile = new File("scratch/test_civil_timetable.pdf");
        doc.save(outputFile);
        doc.close();

        System.out.println("Civil Timetable PDF generated successfully at: " + outputFile.getAbsolutePath());
    }
}
