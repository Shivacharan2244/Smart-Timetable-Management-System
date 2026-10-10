package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.NotificationDTO;
import com.example.smarttimetable.dto.PdfUploadResponseDTO;
import com.example.smarttimetable.dto.TimetableEntryDTO;
import com.example.smarttimetable.entity.*;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.repository.*;
import com.example.smarttimetable.service.NotificationService;
import com.example.smarttimetable.service.PdfParserService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PdfParserServiceImpl implements PdfParserService {

    private static final Logger log = LoggerFactory.getLogger(PdfParserServiceImpl.class);

    private final UploadHistoryRepository uploadHistoryRepository;
    private final UserRepository userRepository;
    private final TimetableRepository timetableRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final RoomRepository roomRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final NotificationService notificationService;

    public PdfParserServiceImpl(UploadHistoryRepository uploadHistoryRepository,
                                UserRepository userRepository,
                                TimetableRepository timetableRepository,
                                TimetableEntryRepository timetableEntryRepository,
                                DepartmentRepository departmentRepository,
                                AcademicYearRepository academicYearRepository,
                                SemesterRepository semesterRepository,
                                SectionRepository sectionRepository,
                                SubjectRepository subjectRepository,
                                FacultyRepository facultyRepository,
                                RoomRepository roomRepository,
                                TimeSlotRepository timeSlotRepository,
                                NotificationService notificationService) {
        this.uploadHistoryRepository = uploadHistoryRepository;
        this.userRepository = userRepository;
        this.timetableRepository = timetableRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.departmentRepository = departmentRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.facultyRepository = facultyRepository;
        this.roomRepository = roomRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.notificationService = notificationService;
    }

    @Override
    public PdfUploadResponseDTO processTimetablePdf(MultipartFile file, Long departmentId, Long academicYearId,
                                                    Long semesterId, Long sectionId, String userEmail) {
        return processTimetablePdf(file, departmentId, null, null, null, academicYearId, semesterId, sectionId, userEmail);
    }

    @Override
    public PdfUploadResponseDTO processTimetablePdf(MultipartFile file, Long departmentId, String departmentName,
                                                    String departmentCode, Long academicYearId,
                                                    Long semesterId, Long sectionId, String userEmail) {
        return processTimetablePdf(file, departmentId, departmentName, departmentCode, null, academicYearId, semesterId, sectionId, userEmail);
    }

    @Override
    @Transactional
    public PdfUploadResponseDTO processTimetablePdf(MultipartFile file, Long departmentId, String departmentName,
                                                    String departmentCode, Integer yearOfStudy, Long academicYearId,
                                                    Long semesterId, Long sectionId, String userEmail) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Uploaded PDF file is empty or missing.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new BusinessException("Only PDF files are accepted for timetable upload.");
        }

        // 1. Resolve Uploader User
        User uploader = null;
        if (userEmail != null && !userEmail.isBlank()) {
            uploader = userRepository.findByEmail(userEmail.trim().toLowerCase()).orElse(null);
        }
        if (uploader == null) {
            uploader = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BusinessException("No system user found to associate with upload."));
        }

        // 2. Save uploaded file to disk
        String storedFilePath = null;
        try {
            Path uploadDir = Paths.get("uploads", "timetables");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            String safeFileName = System.currentTimeMillis() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
            Path targetPath = uploadDir.resolve(safeFileName);
            try (FileOutputStream fos = new FileOutputStream(targetPath.toFile())) {
                fos.write(file.getBytes());
            }
            storedFilePath = targetPath.toAbsolutePath().toString();
        } catch (Exception e) {
            log.warn("Could not save PDF file to disk: {}", e.getMessage());
        }

        // 3. Extract text and parse using Apache PDFBox
        List<ParsedRow> parsedRows = new ArrayList<>();
        ParseOutcome outcome = new ParseOutcome();

        try (InputStream is = file.getInputStream(); PDDocument document = PDDocument.load(is)) {
            PDFTextStripper stripper = new PDFTextStripper();
            int numPages = document.getNumberOfPages();

            stripper.setStartPage(1);
            stripper.setEndPage(1);
            String firstPageText = stripper.getText(document);

            if (isCollegeTimetable(firstPageText)) {
                log.info("Detected College Timetable Structure ({} pages). Using Multi-Page University Parser.", numPages);
                outcome = parseCollegeTimetable(document, stripper, originalFilename, departmentId, departmentName, departmentCode, yearOfStudy, academicYearId, semesterId);
                parsedRows = outcome.rows;
            } else {
                stripper.setStartPage(1);
                stripper.setEndPage(numPages);
                String allText = stripper.getText(document);
                Department detectedDept = detectDepartment(allText, originalFilename, departmentId, departmentName, departmentCode);
                outcome.department = detectedDept;
                YearSemInfo ysi = detectYearAndSemester(allText, originalFilename, yearOfStudy, semesterId, academicYearId);
                outcome.yearOfStudy = ysi.yearOfStudy;
                outcome.yearName = ysi.yearName;
                outcome.semesterNumber = ysi.semesterNumber;
                outcome.semesterName = ysi.semesterName;
                outcome.academicYear = ysi.academicYear;
                Timetable defaultTimetable = resolveOrCreateTimetable(detectedDept.getDepartmentId(), academicYearId, semesterId, sectionId);
                outcome.sectionsInvolved.add(defaultTimetable.getSection().getSectionName());
                parsedRows = parseTextLines(allText, defaultTimetable);
                outcome.rows = parsedRows;
            }
        } catch (Exception e) {
            log.error("Apache PDFBox extraction failed: {}", e.getMessage(), e);
            throw new BusinessException("Failed to read PDF document with Apache PDFBox: " + e.getMessage());
        }

        if (parsedRows.isEmpty()) {
            throw new BusinessException("No recognizable timetable schedule entries could be parsed from the PDF text. " +
                    "Please ensure the document contains day, time/period, subject, faculty, and room information.");
        }

        Department finalDept = outcome.department != null ? outcome.department :
                departmentRepository.findByDepartmentCode("AIML").orElseGet(() -> departmentRepository.findAll().stream().findFirst().orElse(null));

        List<String> conflicts = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        List<TimetableEntryDTO> savedEntries = new ArrayList<>();

        // Create initial UploadHistory record
        UploadHistory uploadHistory = new UploadHistory();
        uploadHistory.setFileName(originalFilename);
        uploadHistory.setFilePath(storedFilePath);
        uploadHistory.setUploadedBy(uploader);
        uploadHistory.setUploadedAt(LocalDateTime.now());
        uploadHistory.setUploadStatus("PROCESSING");
        uploadHistory.setStatus("ACTIVE");
        uploadHistory = uploadHistoryRepository.save(uploadHistory);

        // Ensure time slots exist
        ensureStandardTimeSlots();

        // 4. Process each parsed row
        int totalParsed = parsedRows.size();
        for (ParsedRow row : parsedRows) {
            try {
                Timetable timetable = row.timetable;
                if (timetable == null) {
                    timetable = resolveOrCreateTimetable(finalDept.getDepartmentId(), academicYearId, semesterId, sectionId);
                }

                Department dept = timetable.getDepartment() != null ? timetable.getDepartment() : finalDept;

                // Resolve Subject
                Subject subject = resolveSubject(row.subjectCode, row.subjectName, dept);
                if (subject == null) {
                    errors.add("Row: " + row.day + " Period " + row.periodNumber + " - Subject '" + row.subjectCode + "' could not be resolved.");
                    continue;
                }

                // Resolve Faculty (auto-register if new)
                Faculty faculty = resolveFaculty(row.facultyCode, row.facultyName, dept);

                // Resolve Room (auto-register if new)
                Room room = resolveRoom(row.roomNumber);

                // Resolve TimeSlot
                TimeSlot timeSlot = resolveTimeSlot(row.periodNumber, row.startTime, row.endTime, row.day);
                if (timeSlot == null) {
                    errors.add("Row: " + row.day + " Period " + row.periodNumber + " - Time slot could not be resolved.");
                    continue;
                }

                String dayOfWeek = row.day.toUpperCase();
                Long sectionEntityId = timetable.getSection().getSectionId();

                // Section collision check: only skip if the SAME section already has a class scheduled in this slot
                if (timetableEntryRepository.isDuplicateEntry(timetable.getTimetableId(), dayOfWeek, timeSlot.getTimeSlotId(), null) ||
                    timetableEntryRepository.hasSectionConflict(sectionEntityId, dayOfWeek, timeSlot.getTimeSlotId(), null)) {
                    conflicts.add("Duplicate Entry: Section " + timetable.getSection().getSectionName() + " already has a class scheduled on " + dayOfWeek + " during Period " + timeSlot.getPeriodNumber() + ".");
                    continue;
                }

                // Track faculty assignment across sections as an informational conflict / note
                if (faculty != null && timetableEntryRepository.hasFacultyConflict(faculty.getFacultyId(), dayOfWeek, timeSlot.getTimeSlotId(), null)) {
                    conflicts.add("Faculty Assignment: " + faculty.getFacultyName() + " is assigned across multiple sections on " + dayOfWeek + " during " + timeSlot.getStartTime() + " – " + timeSlot.getEndTime() + ".");
                }

                // Track shared auditorium/room as an informational conflict / note
                if (room != null && timetableEntryRepository.hasRoomConflict(room.getRoomId(), dayOfWeek, timeSlot.getTimeSlotId(), null)) {
                    conflicts.add("Shared Hall: Room " + room.getRoomNumber() + " is utilized across cohorts on " + dayOfWeek + " during " + timeSlot.getStartTime() + " – " + timeSlot.getEndTime() + ".");
                }

                // Persist Valid TimetableEntry
                TimetableEntry entry = new TimetableEntry();
                entry.setTimetable(timetable);
                entry.setDayOfWeek(dayOfWeek);
                entry.setTimeSlot(timeSlot);
                entry.setSubject(subject);
                entry.setFaculty(faculty);
                entry.setRoom(room);
                entry.setUploadHistory(uploadHistory);
                entry.setStatus("ACTIVE");

                TimetableEntry saved = timetableEntryRepository.save(entry);
                savedEntries.add(mapToDTO(saved));

            } catch (Exception ex) {
                log.warn("Error processing row: {}", ex.getMessage());
                errors.add("Row error (" + row.day + " P" + row.periodNumber + "): " + ex.getMessage());
            }
        }

        // 5. Update UploadHistory status and remarks
        String finalStatus;
        if (!savedEntries.isEmpty() && conflicts.isEmpty() && errors.isEmpty()) {
            finalStatus = "SUCCESS";
        } else if (!savedEntries.isEmpty()) {
            finalStatus = "PARTIAL";
        } else {
            finalStatus = "FAILED";
        }

        List<String> sectionsList = new ArrayList<>(outcome.sectionsInvolved);
        String deptDisplay = finalDept != null ? finalDept.getDepartmentName() + " (" + finalDept.getDepartmentCode() + ")" : "General";
        String remarks = String.format("Department: %s | Sections: %s | Extracted %d timetable entries. %d clashes detected. %d unmapped rows.",
                deptDisplay, sectionsList.isEmpty() ? "None" : String.join(", ", sectionsList), savedEntries.size(), conflicts.size(), errors.size());

        uploadHistory.setUploadStatus(finalStatus);
        uploadHistory.setRemarks(remarks);
        uploadHistory.setExtractedCount(savedEntries.size());
        uploadHistory.setConflictCount(conflicts.size());
        uploadHistory.setTotalParsed(totalParsed);
        uploadHistoryRepository.save(uploadHistory);

        // 6. Generate Campus Notification
        try {
            NotificationDTO notif = new NotificationDTO();
            notif.setUserId(uploader.getId());
            notif.setTitle("Timetable PDF Processed (" + (finalDept != null ? finalDept.getDepartmentCode() : "General") + ")");
            notif.setMessage(String.format("File '%s' processed for department %s: %d entries saved, %d sections involved.",
                    originalFilename, finalDept != null ? finalDept.getDepartmentCode() : "N/A", savedEntries.size(), sectionsList.size()));
            notif.setType("TIMETABLE_UPLOAD");
            notif.setReadStatus(false);
            notif.setCreatedAt(LocalDateTime.now());
            notif.setStatus("ACTIVE");
            notificationService.createNotification(notif);
        } catch (Exception ex) {
            log.warn("Failed to generate upload notification: {}", ex.getMessage());
        }

        return new PdfUploadResponseDTO(
                uploadHistory.getUploadId(),
                originalFilename,
                finalStatus,
                savedEntries.size(),
                conflicts.size(),
                totalParsed,
                conflicts,
                errors,
                savedEntries,
                remarks,
                finalDept != null ? finalDept.getDepartmentId() : null,
                finalDept != null ? finalDept.getDepartmentName() : "General",
                finalDept != null ? finalDept.getDepartmentCode() : "GEN",
                sectionsList,
                outcome.yearOfStudy,
                outcome.yearName,
                outcome.semesterNumber,
                outcome.semesterName,
                outcome.academicYear
        );
    }

    private boolean isCollegeTimetable(String text) {
        if (text == null) return false;
        String upper = text.toUpperCase();
        return upper.contains("TIME TABLE") && (upper.contains("BRANCH") || upper.contains("SECTION") || upper.contains("REGULATION") || upper.contains("CATEGORY"));
    }

    /**
     * Parses standard University/College Timetable layouts across multiple pages.
     */
    private ParseOutcome parseCollegeTimetable(PDDocument document, PDFTextStripper stripper,
                                               String originalFilename,
                                               Long departmentId, String departmentName, String departmentCode,
                                               Integer yearOfStudy, Long academicYearId, Long semesterId) throws Exception {
        ParseOutcome outcome = new ParseOutcome();
        int totalPages = document.getNumberOfPages();

        // 1. Detect Department from the first page text and original filename
        stripper.setStartPage(1);
        stripper.setEndPage(1);
        String firstPageText = stripper.getText(document);

        Department primaryDept = detectDepartment(firstPageText, originalFilename, departmentId, departmentName, departmentCode);
        outcome.department = primaryDept;

        // 2. Detect Year of Study, Semester and Academic Year
        YearSemInfo ysi = detectYearAndSemester(firstPageText, originalFilename, yearOfStudy, semesterId, academicYearId);
        outcome.yearOfStudy = ysi.yearOfStudy;
        outcome.yearName = ysi.yearName;
        outcome.semesterNumber = ysi.semesterNumber;
        outcome.semesterName = ysi.semesterName;
        outcome.academicYear = ysi.academicYear;

        AcademicYear resolvedYear = null;
        if (academicYearId != null) {
            resolvedYear = academicYearRepository.findById(academicYearId).orElse(null);
        }
        if (resolvedYear == null) {
            final String ayStr = ysi.academicYear != null ? ysi.academicYear : "2026-2027";
            resolvedYear = academicYearRepository.findByAcademicYear(ayStr)
                    .orElseGet(() -> academicYearRepository.save(new AcademicYear(ayStr, LocalDate.of(2026, 6, 29), LocalDate.of(2027, 5, 31), true, "ACTIVE")));
        }
        final AcademicYear finalYear = resolvedYear;

        Semester resolvedSem = null;
        if (semesterId != null) {
            resolvedSem = semesterRepository.findById(semesterId).orElse(null);
        }
        if (resolvedSem == null) {
            final int semNum = ysi.semesterNumber;
            resolvedSem = semesterRepository.findBySemesterNumber(semNum).stream()
                    .filter(s -> s.getAcademicYear() != null && s.getAcademicYear().getAcademicYearId().equals(finalYear.getAcademicYearId()))
                    .findFirst()
                    .orElseGet(() -> semesterRepository.save(new Semester(semNum, "Semester " + semNum, finalYear, "ACTIVE")));
        }
        final Semester finalSem = resolvedSem;

        for (int p = 1; p <= totalPages; p++) {
            stripper.setStartPage(p);
            stripper.setEndPage(p);
            String pageText = stripper.getText(document);

            // 1. Extract Section Name
            String sectionName = "Section " + (char) ('A' + p - 1);
            Matcher secMat = Pattern.compile("(?i)Branch\\s*&\\s*Section:\\s*([A-Za-z0-9\\s-]+?)(?:\\s+Room|\\r|\\n|$)").matcher(pageText);
            if (secMat.find()) {
                sectionName = secMat.group(1).trim();
            }

            // Check if page specifies another department explicitly
            Department pageDept = primaryDept;
            if (sectionName.contains("-")) {
                String branchPrefix = sectionName.split("[-–]")[0].trim();
                if (isValidDepartmentString(branchPrefix) && !branchPrefix.equalsIgnoreCase(primaryDept.getDepartmentCode())) {
                    pageDept = getOrCreateDepartmentFromIdent(branchPrefix);
                }
            } else if (!sectionName.toUpperCase().contains(primaryDept.getDepartmentCode().toUpperCase())) {
                // If section is just "Section A" or "A", normalize to e.g. "AI - A"
                String cleanSuffix = sectionName.replaceAll("(?i)^Section\\s*", "").trim();
                sectionName = pageDept.getDepartmentCode() + " - " + cleanSuffix;
            }

            outcome.sectionsInvolved.add(sectionName);

            // 2. Extract Default Room Number
            String defaultRoomNumber = "I-306";
            Matcher rmMat = Pattern.compile("(?i)Room\\s*No:\\s*([A-Za-z0-9/-]+)").matcher(pageText);
            if (rmMat.find()) {
                defaultRoomNumber = rmMat.group(1).trim();
                if (defaultRoomNumber.contains("/")) {
                    defaultRoomNumber = defaultRoomNumber.split("/")[0].trim();
                }
            }

            // 3. Extract Class In-charge (Default Faculty)
            String classIncharge = "Faculty In-charge";
            Matcher inchargeMat = Pattern.compile("(?i)Name\\s*of\\s*the\\s*Class\\s*In-charge:\\s*([A-Za-z0-9.\\s]+?)(?:\\s+w\\.e\\.f|\\r|\\n|$)").matcher(pageText);
            if (inchargeMat.find()) {
                classIncharge = inchargeMat.group(1).trim();
            }

            // 4. Resolve or create Section & Timetable (strictly isolated by department and semester)
            final String finalSecName = sectionName;
            final Department finalPageDept = pageDept;
            Section section = sectionRepository.findAll().stream()
                    .filter(s -> s.getSectionName().equalsIgnoreCase(finalSecName) &&
                            (s.getDepartment() != null && s.getDepartment().getDepartmentId().equals(finalPageDept.getDepartmentId())) &&
                            (s.getSemester() != null && s.getSemester().getSemesterId().equals(finalSem.getSemesterId())))
                    .findFirst()
                    .orElseGet(() -> sectionRepository.save(new Section(finalSecName, finalPageDept, finalSem, "ACTIVE")));

            List<Timetable> ttList = timetableRepository.findByDepartment_DepartmentIdAndAcademicYear_AcademicYearIdAndSemester_SemesterIdAndSection_SectionId(
                    finalPageDept.getDepartmentId(), finalYear.getAcademicYearId(), finalSem.getSemesterId(), section.getSectionId());
            Timetable pageTimetable;
            if (!ttList.isEmpty()) {
                pageTimetable = ttList.get(0);
            } else {
                pageTimetable = timetableRepository.save(new Timetable(finalPageDept, finalYear, finalSem, section,
                        LocalDate.of(2026, 6, 29), LocalDate.of(2027, 5, 31), 1, true, "ACTIVE"));
            }

            // 5. Build Legend Map (Abbreviation -> LegendEntry)
            Map<String, LegendEntry> legendMap = buildLegendMap(pageText, classIncharge);

            // 6. Parse Day Grid Rows
            List<ParsedRow> pageRows = parseDayGridRows(pageText, pageTimetable, sectionName, defaultRoomNumber, legendMap, classIncharge);
            outcome.rows.addAll(pageRows);
        }

        return outcome;
    }

    public Department detectDepartment(String text, String filename, Long requestedDeptId, String requestedName, String requestedCode) {
        if (requestedDeptId != null) {
            Optional<Department> opt = departmentRepository.findById(requestedDeptId);
            if (opt.isPresent()) return opt.get();
        }

        if (requestedCode != null && !requestedCode.isBlank()) {
            String code = requestedCode.trim().toUpperCase();
            Optional<Department> opt = departmentRepository.findByDepartmentCode(code);
            if (opt.isPresent()) return opt.get();
            String name = requestedName != null && !requestedName.isBlank() ? requestedName.trim() : resolveFullNameForCode(code);
            Department d = new Department(name, code, "ACTIVE");
            return departmentRepository.save(d);
        }

        if (text == null) text = "";
        String combined = text + " " + (filename != null ? filename : "");

        // 1. Check for explicit Department of ... or Dept: ...
        Matcher deptMat = Pattern.compile("(?i)(?:Department\\s+of|Dept(?:artment)?\\.?\\s*:)\\s*([A-Za-z0-9\\s&,-]+?)(?:\\r|\\n|;|\\.|\\$|Time\\s*Table|\\()").matcher(combined);
        if (deptMat.find()) {
            String extracted = deptMat.group(1).trim();
            if (isValidDepartmentString(extracted)) {
                return getOrCreateDepartmentFromIdent(extracted);
            }
        }

        // 2. Check for HoD - ...
        Matcher hodMat = Pattern.compile("(?i)HoD\\s*[–-]\\s*([A-Za-z0-9\\s&,-]+?)(?:\\s+Dean|\\r|\\n|$)").matcher(combined);
        if (hodMat.find()) {
            String extracted = hodMat.group(1).trim();
            if (isValidDepartmentString(extracted)) {
                return getOrCreateDepartmentFromIdent(extracted);
            }
        }

        // 3. Check for Branch & Section: ...
        Matcher secMat = Pattern.compile("(?i)Branch\\s*(?:&|and)?\\s*Section:\\s*([A-Za-z0-9\\s-]+?)(?:\\s+Room|\\r|\\n|$)").matcher(combined);
        if (secMat.find()) {
            String branchSec = secMat.group(1).trim();
            String branchPart = branchSec.split("[-–]")[0].trim();
            if (isValidDepartmentString(branchPart)) {
                return getOrCreateDepartmentFromIdent(branchPart);
            }
        }

        // 4. Check for Branch: ...
        Matcher branchMat = Pattern.compile("(?i)Branch\\s*:\\s*([A-Za-z0-9\\s&,-]+?)(?:\\s+Section|\\s+Room|\\r|\\n|$)").matcher(combined);
        if (branchMat.find()) {
            String extracted = branchMat.group(1).trim();
            if (isValidDepartmentString(extracted)) {
                return getOrCreateDepartmentFromIdent(extracted);
            }
        }

        // 5. Keyword scanning in text/filename
        String upper = combined.toUpperCase();
        if (upper.contains("COMPUTER SCIENCE") || upper.contains("CSE")) {
            return getOrCreateDepartmentFromIdent("CSE");
        } else if (upper.contains("ELECTRONICS AND COMMUNICATION") || upper.contains("ELECTRONICS & COMMUNICATION") || upper.contains("ECE")) {
            return getOrCreateDepartmentFromIdent("ECE");
        } else if (upper.contains("ELECTRICAL AND ELECTRONICS") || upper.contains("ELECTRICAL & ELECTRONICS") || upper.contains("EEE")) {
            return getOrCreateDepartmentFromIdent("EEE");
        } else if (upper.contains("CIVIL ENGINEERING") || upper.contains("CIVIL")) {
            return getOrCreateDepartmentFromIdent("CIVIL");
        } else if (upper.contains("MECHANICAL ENGINEERING") || upper.contains("MECH")) {
            return getOrCreateDepartmentFromIdent("MECH");
        } else if (upper.contains("INFORMATION TECHNOLOGY") || upper.contains("IT ") || upper.contains(" IT")) {
            return getOrCreateDepartmentFromIdent("IT");
        } else if (upper.contains("DATA SCIENCE") || upper.contains("AIDS") || upper.contains("AI&DS")) {
            return getOrCreateDepartmentFromIdent("AIDS");
        } else if (upper.contains("MACHINE LEARNING") || upper.contains("AIML") || upper.contains("AI&ML")) {
            return getOrCreateDepartmentFromIdent("AIML");
        } else if (upper.contains("ARTIFICIAL INTELLIGENCE") || upper.contains("AI TIMETABLE") || upper.contains("DEPARTMENT OF AI") || upper.contains("DEPT OF AI")) {
            return getOrCreateDepartmentFromIdent("AI");
        }

        // Default: return first active department in DB or AI
        return departmentRepository.findByDepartmentCode("AI")
                .orElseGet(() -> departmentRepository.findByDepartmentCode("AIML")
                        .orElseGet(() -> departmentRepository.findAll().stream().findFirst()
                                .orElseGet(() -> departmentRepository.save(new Department("Artificial Intelligence", "AI", "ACTIVE")))));
    }

    private boolean isValidDepartmentString(String s) {
        if (s == null || s.trim().length() < 2) return false;
        String clean = s.trim().toUpperCase();
        return !clean.equals("THE") && !clean.equals("YEAR") && !clean.equals("SEM") && !clean.equals("SECTION");
    }

    private String resolveFullNameForCode(String code) {
        return switch (code.toUpperCase()) {
            case "AI" -> "Artificial Intelligence";
            case "AIML", "AI&ML" -> "Artificial Intelligence and Machine Learning";
            case "CSE" -> "Computer Science and Engineering";
            case "ECE" -> "Electronics and Communication Engineering";
            case "EEE" -> "Electrical and Electronics Engineering";
            case "CIVIL", "CE" -> "Civil Engineering";
            case "MECH", "ME" -> "Mechanical Engineering";
            case "IT" -> "Information Technology";
            case "AIDS" -> "Artificial Intelligence and Data Science";
            case "CSBS" -> "Computer Science and Business Systems";
            case "CSD" -> "Computer Science and Engineering (Data Science)";
            default -> code + " Department";
        };
    }

    private Department getOrCreateDepartmentFromIdent(String ident) {
        String clean = ident.trim();
        String upper = clean.toUpperCase();
        String code;
        String name;

        if (upper.equals("AI")) {
            code = "AI";
            name = "Artificial Intelligence";
        } else if (upper.equals("AIML") || upper.equals("AI&ML") || upper.contains("MACHINE LEARNING")) {
            code = "AIML";
            name = "Artificial Intelligence and Machine Learning";
        } else if (upper.contains("ARTIFICIAL INTELLIGENCE") && !upper.contains("MACHINE LEARNING")) {
            code = "AI";
            name = "Artificial Intelligence";
        } else if (upper.equals("CSE") || upper.contains("COMPUTER SCIENCE")) {
            code = "CSE";
            name = "Computer Science and Engineering";
        } else if (upper.equals("ECE") || upper.contains("ELECTRONICS AND COMMUNICATION") || upper.contains("ELECTRONICS & COMMUNICATION")) {
            code = "ECE";
            name = "Electronics and Communication Engineering";
        } else if (upper.equals("EEE") || upper.contains("ELECTRICAL AND ELECTRONICS") || upper.contains("ELECTRICAL & ELECTRONICS")) {
            code = "EEE";
            name = "Electrical and Electronics Engineering";
        } else if (upper.equals("CIVIL") || upper.contains("CIVIL ENGINEERING")) {
            code = "CIVIL";
            name = "Civil Engineering";
        } else if (upper.equals("MECH") || upper.equals("ME") || upper.contains("MECHANICAL")) {
            code = "MECH";
            name = "Mechanical Engineering";
        } else if (upper.equals("IT") || upper.contains("INFORMATION TECHNOLOGY")) {
            code = "IT";
            name = "Information Technology";
        } else if (upper.equals("AIDS") || upper.equals("AI&DS") || upper.contains("DATA SCIENCE")) {
            code = "AIDS";
            name = "Artificial Intelligence and Data Science";
        } else if (upper.equals("CSBS") || upper.contains("BUSINESS SYSTEMS")) {
            code = "CSBS";
            name = "Computer Science and Business Systems";
        } else if (upper.equals("CSD")) {
            code = "CSD";
            name = "Computer Science and Engineering (Data Science)";
        } else {
            code = clean.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
            if (code.length() > 6) {
                String[] words = clean.split("\\s+");
                if (words.length > 1) {
                    StringBuilder sb = new StringBuilder();
                    for (String w : words) {
                        if (!w.isEmpty() && Character.isLetter(w.charAt(0))) {
                            sb.append(Character.toUpperCase(w.charAt(0)));
                        }
                    }
                    code = sb.toString();
                } else {
                    code = code.substring(0, Math.min(code.length(), 6));
                }
            }
            name = clean;
        }

        Optional<Department> byCode = departmentRepository.findByDepartmentCode(code);
        if (byCode.isPresent()) return byCode.get();

        for (Department d : departmentRepository.findAll()) {
            if (d.getDepartmentName().equalsIgnoreCase(name) || d.getDepartmentCode().equalsIgnoreCase(code)) {
                return d;
            }
        }

        Department newDept = new Department(name, code, "ACTIVE");
        Department saved = departmentRepository.save(newDept);
        log.info("Auto-registered new Department in database: ID={}, Name='{}', Code='{}'",
                saved.getDepartmentId(), saved.getDepartmentName(), saved.getDepartmentCode());
        return saved;
    }

    public static class YearSemInfo {
        public int yearOfStudy = 1;
        public String yearName = "1st Year";
        public int semesterNumber = 1;
        public String semesterName = "Semester 1";
        public String academicYear = "2026-2027";
    }

    private YearSemInfo detectYearAndSemester(String text, String filename, Integer requestedYear, Long requestedSemId, Long requestedAyId) {
        YearSemInfo info = new YearSemInfo();

        if (text == null) text = "";
        String combined = text + " " + (filename != null ? filename : "");

        // 1. Detect Academic Year: e.g. "A.Y: 2026 – 2027" or "2026-27"
        Matcher ayMat = Pattern.compile("(?i)(?:A\\.?Y\\.?:?\\s*)?(\\d{4})\\s*[–\\-]\\s*(\\d{2,4})").matcher(combined);
        if (ayMat.find()) {
            String startYear = ayMat.group(1);
            String endYear = ayMat.group(2);
            if (endYear.length() == 2) {
                endYear = startYear.substring(0, 2) + endYear;
            }
            info.academicYear = startYear + "-" + endYear;
        }

        // 2. If user explicitly provided yearOfStudy (1, 2, 3, 4)
        if (requestedYear != null && requestedYear >= 1 && requestedYear <= 4) {
            info.yearOfStudy = requestedYear;
            info.yearName = requestedYear == 1 ? "1st Year" : (requestedYear == 2 ? "2nd Year" : (requestedYear == 3 ? "3rd Year" : "4th Year"));
            info.semesterNumber = (requestedYear - 1) * 2 + 1;
            info.semesterName = "Semester " + info.semesterNumber;
            return info;
        }

        // 3. Check for pattern: "Year & Sem: ... III Year I Sem" or "1st Year 1st Sem"
        Matcher headerMat = Pattern.compile("(?i)(?:Year\\s*(?:&|and)\\s*Sem|Year\\s*Sem|Year)\\s*[:\\-]?\\s*(?:B\\.?\\s*Tech)?\\s*(I{1,3}|IV|1st|2nd|3rd|4th|[1-4])\\s*Year\\s*(I{1,2}|1st|2nd|[1-2])?\\s*Sem").matcher(combined);
        if (headerMat.find()) {
            int y = parseYearToken(headerMat.group(1));
            int s = headerMat.group(2) != null ? parseSemToken(headerMat.group(2)) : 1;
            info.yearOfStudy = y;
            info.yearName = y == 1 ? "1st Year" : (y == 2 ? "2nd Year" : (y == 3 ? "3rd Year" : "4th Year"));
            info.semesterNumber = (info.yearOfStudy - 1) * 2 + s;
            info.semesterName = "Semester " + info.semesterNumber;
            return info;
        }

        // 4. Check for pattern in filename or text: "III-I", "I-I", "II-I", "IV-I", "III-II"
        Matcher romanMat = Pattern.compile("(?i)\\b(I{1,3}|IV|1st|2nd|3rd|4th|[1-4])\\s*[-_]\\s*(I{1,2}|1st|2nd|[1-2])\\b").matcher(combined);
        if (romanMat.find()) {
            int y = parseYearToken(romanMat.group(1));
            int s = parseSemToken(romanMat.group(2));
            info.yearOfStudy = y;
            info.yearName = y == 1 ? "1st Year" : (y == 2 ? "2nd Year" : (y == 3 ? "3rd Year" : "4th Year"));
            info.semesterNumber = (info.yearOfStudy - 1) * 2 + s;
            info.semesterName = "Semester " + info.semesterNumber;
            return info;
        }

        // 5. Check for "1st Year", "2nd Year", "3rd Year", "4th Year", "III Year", "I Year", "II Year", "IV Year"
        Matcher yrMat = Pattern.compile("(?i)\\b(1st|2nd|3rd|4th|First|Second|Third|Fourth|I{1,3}|IV|[1-4])\\s*Year\\b").matcher(combined);
        if (yrMat.find()) {
            int y = parseYearToken(yrMat.group(1));
            info.yearOfStudy = y;
            info.yearName = y == 1 ? "1st Year" : (y == 2 ? "2nd Year" : (y == 3 ? "3rd Year" : "4th Year"));
            info.semesterNumber = (info.yearOfStudy - 1) * 2 + 1;
            info.semesterName = "Semester " + info.semesterNumber;
            return info;
        }

        // 6. Check for "I B.Tech", "II B.Tech", "III B.Tech", "IV B.Tech"
        Matcher btechMat = Pattern.compile("(?i)\\b(I{1,3}|IV|1st|2nd|3rd|4th|[1-4])\\s*(?:B\\.?\\s*Tech)\\b").matcher(combined);
        if (btechMat.find()) {
            int y = parseYearToken(btechMat.group(1));
            info.yearOfStudy = y;
            info.yearName = y == 1 ? "1st Year" : (y == 2 ? "2nd Year" : (y == 3 ? "3rd Year" : "4th Year"));
            info.semesterNumber = (info.yearOfStudy - 1) * 2 + 1;
            info.semesterName = "Semester " + info.semesterNumber;
            return info;
        }

        return info;
    }

    private int parseYearToken(String token) {
        if (token == null) return 1;
        String t = token.trim().toUpperCase();
        if (t.equals("I") || t.startsWith("1") || t.contains("FIRST")) return 1;
        if (t.equals("II") || t.startsWith("2") || t.contains("SECOND")) return 2;
        if (t.equals("III") || t.startsWith("3") || t.contains("THIRD")) return 3;
        if (t.equals("IV") || t.startsWith("4") || t.contains("FOURTH")) return 4;
        return 1;
    }

    private int parseSemToken(String token) {
        if (token == null) return 1;
        String t = token.trim().toUpperCase();
        if (t.equals("II") || t.startsWith("2") || t.contains("SECOND")) return 2;
        return 1;
    }

    private static class ParseOutcome {
        List<ParsedRow> rows = new ArrayList<>();
        Department department;
        Set<String> sectionsInvolved = new LinkedHashSet<>();
        Integer yearOfStudy = 1;
        String yearName = "1st Year";
        Integer semesterNumber = 1;
        String semesterName = "Semester 1";
        String academicYear = "2026-2027";
    }

    private static class LegendEntry {
        String courseCode;
        String subjectName;
        String facultyName;

        LegendEntry(String courseCode, String subjectName, String facultyName) {
            this.courseCode = courseCode;
            this.subjectName = subjectName;
            this.facultyName = facultyName;
        }
    }

    private Map<String, LegendEntry> buildLegendMap(String pageText, String defaultIncharge) {
        Map<String, LegendEntry> map = new LinkedHashMap<>();

        // Non-credit standard entries
        map.put("LIB", new LegendEntry("LIB", "Library", defaultIncharge));
        map.put("LIBRARY", new LegendEntry("LIB", "Library", defaultIncharge));
        map.put("COUN", new LegendEntry("COUN", "Counseling", defaultIncharge));
        map.put("COUNSELING", new LegendEntry("COUN", "Counseling", defaultIncharge));
        map.put("SPORTS", new LegendEntry("SPORTS", "Sports", "Sports Coordinator"));
        map.put("NSO", new LegendEntry("A55091", "NSO / NSS / Outreach Activities", defaultIncharge));
        map.put("NSS", new LegendEntry("A55091", "NSO / NSS / Outreach Activities", defaultIncharge));
        map.put("OUTREACH", new LegendEntry("A55091", "NSO / NSS / Outreach Activities", defaultIncharge));
        map.put("CLUB ACTIVITIES", new LegendEntry("A55091", "NSO / NSS / Outreach Activities", defaultIncharge));
        map.put("NSO / NSS / OUTREACH / CLUB ACTIVITIES", new LegendEntry("A55091", "NSO / NSS / Outreach Activities", defaultIncharge));

        // Scan page text lines for Legend Table rows
        String[] lines = pageText.split("\\r?\\n");
        for (String line : lines) {
            line = line.trim();
            // Regex to match lines like:
            // PC EMA3180 Deep Learning (DL) 3 4 Ms P. Archana
            // PC-Lab EMA3180P Deep Learning Lab (DL LAB) 1 3 Ms P. Archana
            Matcher m = Pattern.compile("(?i)(?:PC-Lab|PC|OEC-I|OEC|BS|BSC|MC|ESC-Lab|ESC|PCC-Lab|PCC|PEC|HSMC|PROJ|PW)?\\s*([A-Z0-9/]+)\\s+(.+?\\(([A-Z0-9 -]+)\\))\\s+(?:\\d+\\s+)?(?:\\d+\\s+)?([A-Za-z0-9.,\\s]+)").matcher(line);
            if (m.find()) {
                String code = m.group(1).trim();
                String fullName = m.group(2).trim();
                String abbr = m.group(3).trim().toUpperCase();
                String faculty = m.group(4).trim().replaceAll("(?i)\\b(credits|lectures|week|students|group)\\b.*", "").trim();

                map.put(abbr, new LegendEntry(code, fullName, faculty));
                if ("TT".equalsIgnoreCase(abbr)) {
                    map.put("TECHNICAL TRAINING", new LegendEntry(code, fullName, faculty));
                }
            }
        }

        // Add standard AIML curriculum fallbacks if not parsed
        map.putIfAbsent("DL", new LegendEntry("EMA3180", "Deep Learning", "Ms P. Archana"));
        map.putIfAbsent("DL LAB", new LegendEntry("EMA3180P", "Deep Learning Lab", "Ms P. Archana"));
        map.putIfAbsent("EWP", new LegendEntry("EMA3181", "Essentials of Web Programming", "Ms K Lavanya"));
        map.putIfAbsent("EWP LAB", new LegendEntry("EMA3181P", "Essentials of Web Programming Lab", "Ms K Lavanya"));
        map.putIfAbsent("FOS", new LegendEntry("EMA3182", "Foundations of Operating Systems", "Ms. S. Anitha"));
        map.putIfAbsent("OEC-I", new LegendEntry("ESI3X01", "Open Elective-I / Summer Internship", "Ms P. Archana"));
        map.putIfAbsent("OCE-I", new LegendEntry("ESI3X01", "Open Elective-I / Summer Internship", "Ms P. Archana"));
        map.putIfAbsent("PSE-I", new LegendEntry("ESE3101", "Problem Solving in Engineering-I", "Ms P. Archana"));
        map.putIfAbsent("QALR-II", new LegendEntry("EMI3105", "Quantitative Aptitude and Logical Reasoning-II", "Mr. D. Harish Kumar"));
        map.putIfAbsent("TT", new LegendEntry("EMA3151/52", "Technical Training (Full Stack Java)", "Mr. Vineeth"));
        map.putIfAbsent("TECHNICAL TRAINING", new LegendEntry("EMA3151/52", "Technical Training (Full Stack Java)", "Mr. Vineeth"));

        return map;
    }

    private Pattern buildTokenPattern(Map<String, LegendEntry> legendMap) {
        List<String> tokens = new ArrayList<>(legendMap.keySet());
        tokens.add("TECHNICAL TRAINING");
        tokens.add("COUNSELING");
        tokens.add("COUN");
        tokens.add("LIBRARY");
        tokens.add("LIB");
        tokens.add("SPORTS");
        tokens.add("NSO / NSS / OUTREACH / CLUB ACTIVITIES");
        tokens.add("NSO / NSS");
        tokens.add("NSO");
        tokens.add("NSS");
        tokens.add("SEMINAR");
        tokens.add("PROJECT");
        tokens.add("INTERNSHIP");

        tokens.sort((a, b) -> Integer.compare(b.length(), a.length()));

        StringBuilder sb = new StringBuilder("(?i)(");
        for (int i = 0; i < tokens.size(); i++) {
            if (i > 0) sb.append("|");
            sb.append(Pattern.quote(tokens.get(i)));
            sb.append("(?:\\s*\\([A-Za-z0-9-]+\\))?");
        }
        sb.append("|[A-Za-z0-9/&+-]{2,15}(?:\\s+LAB)?(?:\\s*\\([A-Za-z0-9-]+\\))?");
        sb.append(")");

        return Pattern.compile(sb.toString());
    }

    private List<ParsedRow> parseDayGridRows(String pageText, Timetable timetable, String sectionName,
                                            String defaultRoom, Map<String, LegendEntry> legendMap, String defaultFaculty) {
        List<ParsedRow> rows = new ArrayList<>();
        String[] days = {"MON", "TUES", "WED", "THU", "FRI", "SAT"};

        String[] lines = pageText.split("\\r?\\n");
        for (String rawLine : lines) {
            String line = rawLine.trim();
            for (String day : days) {
                if (line.toUpperCase().startsWith(day + " ") || line.toUpperCase().startsWith(day + "\t")) {
                    String content = line.substring(day.length()).trim();
                    List<ParsedRow> dayRows = parseDayTokens(content, day, timetable, sectionName, defaultRoom, legendMap, defaultFaculty);
                    rows.addAll(dayRows);
                    break;
                }
            }
        }

        return rows;
    }

    private List<ParsedRow> parseDayTokens(String content, String day, Timetable timetable,
                                          String sectionName, String defaultRoom,
                                          Map<String, LegendEntry> legendMap, String defaultFaculty) {
        List<ParsedRow> list = new ArrayList<>();
        String fullDay = switch (day.toUpperCase()) {
            case "MON" -> "MONDAY";
            case "TUES" -> "TUESDAY";
            case "WED" -> "WEDNESDAY";
            case "THU" -> "THURSDAY";
            case "FRI" -> "FRIDAY";
            case "SAT" -> "SATURDAY";
            default -> day.toUpperCase();
        };

        Pattern tokenPattern = buildTokenPattern(legendMap);

        Matcher m = tokenPattern.matcher(content);
        List<String> rawTokens = new ArrayList<>();
        while (m.find()) {
            rawTokens.add(m.group(1).trim());
        }

        if (rawTokens.isEmpty()) {
            return list;
        }

        // Handle Saturday activities
        if ("SATURDAY".equalsIgnoreCase(fullDay)) {
            for (String tok : rawTokens) {
                if (tok.toUpperCase().contains("SPORTS")) {
                    for (int p = 5; p <= 7; p++) {
                        list.add(createRow(fullDay, p, tok, defaultRoom, timetable, sectionName, legendMap, defaultFaculty));
                    }
                } else {
                    for (int p = 1; p <= 4; p++) {
                        list.add(createRow(fullDay, p, tok, defaultRoom, timetable, sectionName, legendMap, defaultFaculty));
                    }
                }
            }
            return list;
        }

        // Handle Monday Technical Training full-day blocks
        if (rawTokens.size() <= 2 && rawTokens.get(0).toUpperCase().contains("TECHNICAL TRAINING")) {
            for (int p = 1; p <= 4; p++) {
                list.add(createRow(fullDay, p, rawTokens.get(0), defaultRoom, timetable, sectionName, legendMap, defaultFaculty));
            }
            String pmTok = rawTokens.size() > 1 ? rawTokens.get(1) : rawTokens.get(0);
            for (int p = 5; p <= 7; p++) {
                list.add(createRow(fullDay, p, pmTok, defaultRoom, timetable, sectionName, legendMap, defaultFaculty));
            }
            return list;
        }

        // Standard Weekday Allocation (Periods 1-4 morning, Periods 5-7 afternoon)
        int morningPeriod = 1;
        for (String tok : rawTokens) {
            String upper = tok.toUpperCase();

            // Afternoon multi-period lab / practical block (DL LAB, EWP LAB, or afternoon PSE-I)
            if (upper.contains("LAB") || (morningPeriod > 4 && upper.contains("PSE-I"))) {
                for (int p = 5; p <= 7; p++) {
                    list.add(createRow(fullDay, p, tok, defaultRoom, timetable, sectionName, legendMap, defaultFaculty));
                }
                break;
            }

            // Morning 2-period practical block (QALR-II or morning PSE-I spanning 2 periods)
            if (morningPeriod <= 4 && (upper.contains("QALR-II") || upper.contains("PSE-I"))) {
                list.add(createRow(fullDay, morningPeriod, tok, defaultRoom, timetable, sectionName, legendMap, defaultFaculty));
                morningPeriod++;
                if (morningPeriod <= 4) {
                    list.add(createRow(fullDay, morningPeriod, tok, defaultRoom, timetable, sectionName, legendMap, defaultFaculty));
                    morningPeriod++;
                }
                continue;
            }

            // Single period lecture
            if (morningPeriod <= 4) {
                list.add(createRow(fullDay, morningPeriod, tok, defaultRoom, timetable, sectionName, legendMap, defaultFaculty));
                morningPeriod++;
            } else if (morningPeriod <= 7) {
                list.add(createRow(fullDay, morningPeriod, tok, defaultRoom, timetable, sectionName, legendMap, defaultFaculty));
                morningPeriod++;
            }
        }

        return list;
    }

    private ParsedRow createRow(String day, int period, String token, String defaultRoom,
                               Timetable timetable, String sectionName,
                               Map<String, LegendEntry> legendMap, String defaultFaculty) {
        ParsedRow r = new ParsedRow();
        r.timetable = timetable;
        r.sectionName = sectionName;
        r.day = day;
        r.periodNumber = period;
        r.startTime = getPeriodStart(period);
        r.endTime = getPeriodEnd(period);

        // Extract Room in parentheses if present, e.g. "QALR-II(A-422)"
        String room = defaultRoom;
        Matcher rmMat = Pattern.compile("\\(([A-Za-z0-9-]+)\\)").matcher(token);
        if (rmMat.find()) {
            room = rmMat.group(1).trim();
        }
        r.roomNumber = room;

        // Clean subject key
        String cleanKey = token.replaceAll("\\([A-Za-z0-9-]+\\)", "").trim().toUpperCase();

        LegendEntry legend = legendMap.get(cleanKey);
        if (legend == null) {
            for (Map.Entry<String, LegendEntry> e : legendMap.entrySet()) {
                if (cleanKey.contains(e.getKey()) || e.getKey().contains(cleanKey)) {
                    legend = e.getValue();
                    break;
                }
            }
        }

        if (legend != null) {
            r.subjectCode = legend.courseCode;
            r.subjectName = legend.subjectName;
            r.facultyName = legend.facultyName != null ? legend.facultyName : defaultFaculty;
        } else {
            r.subjectCode = cleanKey;
            r.subjectName = cleanKey;
            r.facultyName = defaultFaculty;
        }

        return r;
    }

    private LocalTime getPeriodStart(int period) {
        return switch (period) {
            case 1 -> LocalTime.of(9, 0);
            case 2 -> LocalTime.of(9, 55);
            case 3 -> LocalTime.of(10, 50);
            case 4 -> LocalTime.of(11, 45);
            case 5 -> LocalTime.of(13, 20);
            case 6 -> LocalTime.of(14, 15);
            case 7 -> LocalTime.of(15, 10);
            default -> LocalTime.of(9, 0);
        };
    }

    private LocalTime getPeriodEnd(int period) {
        return switch (period) {
            case 1 -> LocalTime.of(9, 55);
            case 2 -> LocalTime.of(10, 50);
            case 3 -> LocalTime.of(11, 45);
            case 4 -> LocalTime.of(12, 40);
            case 5 -> LocalTime.of(14, 15);
            case 6 -> LocalTime.of(15, 10);
            case 7 -> LocalTime.of(16, 5);
            default -> LocalTime.of(10, 0);
        };
    }

    private void ensureStandardTimeSlots() {
        for (int p = 1; p <= 7; p++) {
            final int periodNum = p;
            boolean exists = timeSlotRepository.findAll().stream()
                    .anyMatch(ts -> ts.getPeriodNumber() != null && ts.getPeriodNumber().equals(periodNum));
            if (!exists) {
                TimeSlot ts = new TimeSlot("DAY_1", p, getPeriodStart(p), getPeriodEnd(p), "ACTIVE");
                timeSlotRepository.save(ts);
            }
        }
    }

    private List<ParsedRow> parseTextLines(String text, Timetable timetable) {
        List<ParsedRow> results = new ArrayList<>();
        String[] lines = text.split("\\r?\\n");

        Pattern dayPattern = Pattern.compile("(?i)\\b(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY)\\b");
        Pattern timePattern = Pattern.compile("(\\d{1,2}:\\d{2})\\s*(?:-|to)\\s*(\\d{1,2}:\\d{2})");
        Pattern periodPattern = Pattern.compile("(?i)(?:Period|P)\\s*([1-8])");

        String currentDay = "MONDAY";

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty() || line.startsWith("#") || line.toLowerCase().startsWith("smart timetable")) {
                continue;
            }

            Matcher dayMatcher = dayPattern.matcher(line);
            if (dayMatcher.find()) {
                currentDay = dayMatcher.group(1).toUpperCase();
            }

            if (line.contains("|") || line.contains(",")) {
                String[] parts = line.split("[|,]+");
                if (parts.length >= 4) {
                    ParsedRow row = new ParsedRow();
                    row.timetable = timetable;
                    row.day = currentDay;

                    for (String part : parts) {
                        part = part.trim();
                        Matcher dMat = dayPattern.matcher(part);
                        if (dMat.matches()) {
                            row.day = part.toUpperCase();
                            continue;
                        }
                        Matcher tMat = timePattern.matcher(part);
                        if (tMat.find()) {
                            row.startTime = LocalTime.parse(tMat.group(1).length() == 4 ? "0" + tMat.group(1) : tMat.group(1));
                            row.endTime = LocalTime.parse(tMat.group(2).length() == 4 ? "0" + tMat.group(2) : tMat.group(2));
                            continue;
                        }
                        Matcher pMat = periodPattern.matcher(part);
                        if (pMat.find()) {
                            row.periodNumber = Integer.parseInt(pMat.group(1));
                            continue;
                        }
                        if (part.matches("^[1-8]$")) {
                            row.periodNumber = Integer.parseInt(part);
                            continue;
                        }
                        if (part.matches("^[A-Z]{2,5}\\d{3,4}[A-Z]?$")) {
                            row.subjectCode = part;
                            continue;
                        }
                        if (part.toUpperCase().startsWith("FAC-")) {
                            row.facultyCode = part.toUpperCase();
                            continue;
                        }
                        if (part.matches("^(?:Room\\s*)?([A-Z]?\\d{2,4}|[A-Z]-\\d{2,4}|Lab\\s*\\d+)$")) {
                            row.roomNumber = part.replaceAll("(?i)Room\\s*", "").trim();
                            continue;
                        }
                        if (part.toLowerCase().contains("dr.") || part.toLowerCase().contains("prof.") || part.toLowerCase().contains("faculty") || part.toLowerCase().contains("ms") || part.toLowerCase().contains("mr")) {
                            row.facultyName = part;
                            continue;
                        }
                        if (row.subjectName == null && part.length() > 3 && !part.matches("^[0-9:]+$")) {
                            row.subjectName = part;
                        }
                    }

                    if (row.periodNumber == null && row.startTime == null) {
                        row.periodNumber = 1;
                    }
                    if (row.subjectCode != null || row.subjectName != null) {
                        results.add(row);
                    }
                }
            }
        }

        return results;
    }

    private Timetable resolveOrCreateTimetable(Long departmentId, Long academicYearId, Long semesterId, Long sectionId) {
        if (sectionId != null) {
            List<Timetable> list = timetableRepository.findBySection_SectionId(sectionId);
            if (!list.isEmpty()) {
                return list.get(0);
            }
        }

        Department dept = null;
        if (departmentId != null) {
            dept = departmentRepository.findById(departmentId).orElse(null);
        }
        if (dept == null) {
            dept = departmentRepository.findByDepartmentCode("AIML")
                    .orElseGet(() -> departmentRepository.findAll().stream().findFirst()
                            .orElseGet(() -> departmentRepository.save(new Department("Artificial Intelligence and Machine Learning", "AIML", "ACTIVE"))));
        }

        AcademicYear year = null;
        if (academicYearId != null) {
            year = academicYearRepository.findById(academicYearId).orElse(null);
        }
        if (year == null) {
            year = academicYearRepository.findByAcademicYear("2026-2027")
                    .orElseGet(() -> academicYearRepository.findAll().stream().findFirst()
                            .orElseGet(() -> academicYearRepository.save(new AcademicYear("2026-2027", LocalDate.of(2026, 6, 29), LocalDate.of(2027, 5, 31), true, "ACTIVE"))));
        }

        Semester sem = null;
        if (semesterId != null) {
            sem = semesterRepository.findById(semesterId).orElse(null);
        }
        if (sem == null) {
            final AcademicYear finalYear = year;
            sem = semesterRepository.findBySemesterNumber(5).stream().findFirst()
                    .orElseGet(() -> semesterRepository.findAll().stream().findFirst()
                            .orElseGet(() -> semesterRepository.save(new Semester(5, "Semester 5", finalYear, "ACTIVE"))));
        }

        Section sec = null;
        if (sectionId != null) {
            sec = sectionRepository.findById(sectionId).orElse(null);
        }
        if (sec == null) {
            final Department finalDept = dept;
            final Semester finalSem = sem;
            String defaultSecName = dept.getDepartmentCode() + " - A";
            sec = sectionRepository.findAll().stream()
                    .filter(s -> s.getDepartment() != null && s.getDepartment().getDepartmentId().equals(finalDept.getDepartmentId()))
                    .findFirst()
                    .orElseGet(() -> sectionRepository.save(new Section(defaultSecName, finalDept, finalSem, "ACTIVE")));
        }

        List<Timetable> existing = timetableRepository.findBySection_SectionId(sec.getSectionId());
        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        Timetable newTimetable = new Timetable(
                dept,
                year,
                sem,
                sec,
                LocalDate.of(2026, 6, 29),
                LocalDate.of(2027, 5, 31),
                1,
                true,
                "ACTIVE"
        );
        return timetableRepository.save(newTimetable);
    }

    private Subject resolveSubject(String code, String name, Department dept) {
        if (code != null && !code.isBlank()) {
            Optional<Subject> opt = subjectRepository.findBySubjectCode(code.trim().toUpperCase());
            if (opt.isPresent()) return opt.get();
        }
        if (name != null && !name.isBlank()) {
            for (Subject s : subjectRepository.findAll()) {
                if (s.getSubjectName().equalsIgnoreCase(name.trim())) return s;
            }
        }
        if (code != null && !code.isBlank()) {
            String subName = name != null && !name.isBlank() ? name.trim() : "Course " + code.trim().toUpperCase();
            Semester semester = semesterRepository.findAll().stream().findFirst().orElse(null);
            Subject newSub = new Subject(subName, code.trim().toUpperCase(), dept, semester, "ACTIVE");
            return subjectRepository.save(newSub);
        }
        return subjectRepository.findAll().stream().findFirst().orElse(null);
    }

    private Faculty resolveFaculty(String code, String name, Department dept) {
        if (code != null && !code.isBlank()) {
            Optional<Faculty> opt = facultyRepository.findByFacultyCode(code.trim().toUpperCase());
            if (opt.isPresent()) return opt.get();
        }
        if (name != null && !name.isBlank()) {
            String cleanName = name.trim();
            if (cleanName.contains(",")) {
                cleanName = cleanName.split(",")[0].trim();
            }
            cleanName = cleanName.replaceAll("[.,]+$", "").trim();

            for (Faculty f : facultyRepository.findAll()) {
                if (f.getFacultyName().equalsIgnoreCase(cleanName) ||
                        cleanName.toLowerCase().contains(f.getFacultyName().toLowerCase()) ||
                        f.getFacultyName().toLowerCase().contains(cleanName.toLowerCase())) {
                    return f;
                }
            }

            // Generate slug for code and email
            String slug = cleanName.replaceAll("(?i)^(Dr\\.?|Mr\\.?|Ms\\.?|Prof\\.?)\\s*", "")
                    .replaceAll("[^a-zA-Z]", "").toUpperCase();
            if (slug.length() > 10) slug = slug.substring(0, 10);
            String genCode = "FAC-" + (slug.isEmpty() ? "UNIV" + (System.currentTimeMillis() % 1000) : slug);
            String genEmail = (slug.isEmpty() ? "faculty" : slug.toLowerCase()) + "@anurag.edu.in";

            Optional<Faculty> emailOpt = facultyRepository.findByEmail(genEmail);
            if (emailOpt.isPresent()) {
                return emailOpt.get();
            }
            Optional<Faculty> codeOpt = facultyRepository.findByFacultyCode(genCode);
            if (codeOpt.isPresent()) {
                return codeOpt.get();
            }

            Faculty newFac = new Faculty(cleanName, genCode, genEmail, dept, "ACTIVE");
            return facultyRepository.save(newFac);
        }
        return facultyRepository.findAll().stream().findFirst().orElse(null);
    }

    private Room resolveRoom(String roomNumber) {
        if (roomNumber != null && !roomNumber.isBlank()) {
            Optional<Room> opt = roomRepository.findByRoomNumber(roomNumber.trim());
            if (opt.isPresent()) return opt.get();
            for (Room r : roomRepository.findAll()) {
                if (r.getRoomNumber().equalsIgnoreCase(roomNumber.trim())) return r;
            }
            // Auto create room if not found
            Room newRoom = new Room("Classroom " + roomNumber.trim(), roomNumber.trim(),
                    roomNumber.toLowerCase().contains("lab") ? "LAB" : "CLASSROOM", 60, "ACTIVE");
            return roomRepository.save(newRoom);
        }
        return roomRepository.findAll().stream().findFirst().orElse(null);
    }

    private TimeSlot resolveTimeSlot(Integer periodNumber, LocalTime start, LocalTime end, String day) {
        if (periodNumber != null) {
            for (TimeSlot ts : timeSlotRepository.findAll()) {
                if (ts.getPeriodNumber() != null && ts.getPeriodNumber().equals(periodNumber)) {
                    return ts;
                }
            }
        }
        if (start != null) {
            for (TimeSlot ts : timeSlotRepository.findAll()) {
                if (ts.getStartTime() != null && ts.getStartTime().equals(start)) {
                    return ts;
                }
            }
        }
        int p = periodNumber != null ? periodNumber : 1;
        TimeSlot newSlot = new TimeSlot("DAY_1", p, getPeriodStart(p), getPeriodEnd(p), "ACTIVE");
        return timeSlotRepository.save(newSlot);
    }

    private TimetableEntryDTO mapToDTO(TimetableEntry te) {
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
    }

    private static class ParsedRow {
        Timetable timetable;
        String sectionName;
        String day = "MONDAY";
        Integer periodNumber;
        LocalTime startTime;
        LocalTime endTime;
        String subjectCode;
        String subjectName;
        String facultyCode;
        String facultyName;
        String roomNumber;
    }
}
