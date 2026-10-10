package com.example.smarttimetable;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileWriter;

public class InspectPdfTest {

    @Test
    public void dumpPdf() throws Exception {
        File file = new File("uploads/timetables/1791278578542_III-I_AIML_Timetable_AY_2026-27-_V6.pdf");
        if (!file.exists()) {
            System.out.println("File does not exist: " + file.getAbsolutePath());
            return;
        }

        PDDocument doc = PDDocument.load(file);
        PDFTextStripper stripper = new PDFTextStripper();
        String text = stripper.getText(doc);
        doc.close();

        File out = new File("scratch/dump_aiml_pdf.txt");
        try (FileWriter fw = new FileWriter(out)) {
            fw.write(text);
        }
        System.out.println("PDF text dumped! Total chars: " + text.length());
    }
}
