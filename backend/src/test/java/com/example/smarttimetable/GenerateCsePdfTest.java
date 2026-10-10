package com.example.smarttimetable;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.junit.jupiter.api.Test;

import java.io.File;

public class GenerateCsePdfTest {

    @Test
    public void generateCseTimetablePdf() throws Exception {
        File dir = new File("scratch");
        if (!dir.exists()) dir.mkdirs();

        PDDocument doc = new PDDocument();

        // Page 1: CSE - A
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
        stream1.showText("Branch & Section: CSE - A              Room No: C-201");

        stream1.setFont(PDType1Font.HELVETICA, 10);
        stream1.newLineAtOffset(0, -20);
        stream1.showText("Name of the Class In-charge: Dr. Rajesh Sharma  w.e.f: 29th June 2026");

        stream1.newLineAtOffset(0, -25);
        stream1.showText("MON DBMS OS CN DAA COUN OS LAB(C-301)");

        stream1.newLineAtOffset(0, -20);
        stream1.showText("TUES TECHNICAL TRAINING(C-201) TECHNICAL TRAINING(C-201)");

        stream1.newLineAtOffset(0, -20);
        stream1.showText("WED OS CN DBMS DAA LIB CN LAB(C-302)");

        stream1.newLineAtOffset(0, -20);
        stream1.showText("THU CN DAA OS DBMS COUN");

        stream1.newLineAtOffset(0, -20);
        stream1.showText("FRI DAA DBMS CN OS LIB");

        stream1.newLineAtOffset(0, -20);
        stream1.showText("SAT NSO / NSS / OUTREACH / CLUB ACTIVITIES SPORTS");

        stream1.setFont(PDType1Font.HELVETICA_BOLD, 10);
        stream1.newLineAtOffset(0, -35);
        stream1.showText("Category Course Code Name of the Subject Credits Lectures Faculty");

        stream1.setFont(PDType1Font.HELVETICA, 9);
        stream1.newLineAtOffset(0, -18);
        stream1.showText("PC CS3101 Database Management Systems (DBMS) 3 4 Dr. Rajesh Sharma");

        stream1.newLineAtOffset(0, -16);
        stream1.showText("PC CS3102 Operating Systems (OS) 3 4 Prof. Sunita V");

        stream1.newLineAtOffset(0, -16);
        stream1.showText("PC CS3103 Computer Networks (CN) 3 4 Mr. K. Srinivas");

        stream1.newLineAtOffset(0, -16);
        stream1.showText("PC CS3104 Design & Analysis of Algorithms (DAA) 3 4 Dr. M. Verma");

        stream1.newLineAtOffset(0, -16);
        stream1.showText("PC-Lab CS3105 Operating Systems Lab (OS LAB) 1 3 Prof. Sunita V");

        stream1.newLineAtOffset(0, -16);
        stream1.showText("PC-Lab CS3106 Computer Networks Lab (CN LAB) 1 3 Mr. K. Srinivas");

        stream1.newLineAtOffset(0, -30);
        stream1.showText("Class In-charge   Academic Coordinator   HoD - CSE   Dean- SoE");

        stream1.endText();
        stream1.close();

        // Page 2: CSE - B
        PDPage page2 = new PDPage();
        doc.addPage(page2);

        PDPageContentStream stream2 = new PDPageContentStream(doc, page2);
        stream2.beginText();
        stream2.setFont(PDType1Font.HELVETICA_BOLD, 12);
        stream2.newLineAtOffset(50, 750);
        stream2.showText("TIME TABLE");

        stream2.setFont(PDType1Font.HELVETICA, 10);
        stream2.newLineAtOffset(0, -20);
        stream2.showText("Year & Sem: B. Tech III Year I Sem  A.Y: 2026 - 2027  Regulation: R24");

        stream2.setFont(PDType1Font.HELVETICA_BOLD, 10);
        stream2.newLineAtOffset(0, -20);
        stream2.showText("Branch & Section: CSE - B              Room No: C-202");

        stream2.setFont(PDType1Font.HELVETICA, 10);
        stream2.newLineAtOffset(0, -20);
        stream2.showText("Name of the Class In-charge: Dr. M. Verma  w.e.f: 29th June 2026");

        stream2.newLineAtOffset(0, -25);
        stream2.showText("MON OS CN DAA DBMS COUN CN LAB(C-302)");

        stream2.newLineAtOffset(0, -20);
        stream2.showText("TUES DBMS OS CN DAA LIB OS LAB(C-301)");

        stream2.newLineAtOffset(0, -20);
        stream2.showText("WED TECHNICAL TRAINING(C-202) TECHNICAL TRAINING(C-202)");

        stream2.newLineAtOffset(0, -20);
        stream2.showText("THU DAA DBMS OS CN COUN");

        stream2.newLineAtOffset(0, -20);
        stream2.showText("FRI CN DAA DBMS OS LIB");

        stream2.newLineAtOffset(0, -20);
        stream2.showText("SAT NSO / NSS / OUTREACH / CLUB ACTIVITIES SPORTS");

        stream2.setFont(PDType1Font.HELVETICA_BOLD, 10);
        stream2.newLineAtOffset(0, -35);
        stream2.showText("Category Course Code Name of the Subject Credits Lectures Faculty");

        stream2.setFont(PDType1Font.HELVETICA, 9);
        stream2.newLineAtOffset(0, -18);
        stream2.showText("PC CS3101 Database Management Systems (DBMS) 3 4 Dr. Rajesh Sharma");

        stream2.newLineAtOffset(0, -16);
        stream2.showText("PC CS3102 Operating Systems (OS) 3 4 Prof. Sunita V");

        stream2.newLineAtOffset(0, -16);
        stream2.showText("PC CS3103 Computer Networks (CN) 3 4 Mr. K. Srinivas");

        stream2.newLineAtOffset(0, -16);
        stream2.showText("PC CS3104 Design & Analysis of Algorithms (DAA) 3 4 Dr. M. Verma");

        stream2.newLineAtOffset(0, -30);
        stream2.showText("Class In-charge   Academic Coordinator   HoD - CSE   Dean- SoE");

        stream2.endText();
        stream2.close();

        File outputFile = new File("scratch/test_cse_timetable.pdf");
        doc.save(outputFile);
        doc.close();

        System.out.println("CSE Timetable PDF generated successfully at: " + outputFile.getAbsolutePath());
    }
}
