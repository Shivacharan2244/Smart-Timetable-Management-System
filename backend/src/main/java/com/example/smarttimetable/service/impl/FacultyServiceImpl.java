package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.FacultyDTO;
import com.example.smarttimetable.entity.Department;
import com.example.smarttimetable.entity.Faculty;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ConflictException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.DepartmentRepository;
import com.example.smarttimetable.repository.FacultyRepository;
import com.example.smarttimetable.service.FacultyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.smarttimetable.entity.TimeSlot;
import com.example.smarttimetable.entity.Meeting;
import com.example.smarttimetable.entity.TimetableEntry;
import com.example.smarttimetable.repository.MeetingRepository;
import com.example.smarttimetable.repository.TimeSlotRepository;
import com.example.smarttimetable.repository.TimetableEntryRepository;

import com.example.smarttimetable.entity.LiveClass;
import com.example.smarttimetable.repository.LiveClassRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final MeetingRepository meetingRepository;
    private final LiveClassRepository liveClassRepository;

    public FacultyServiceImpl(FacultyRepository facultyRepository,
                              DepartmentRepository departmentRepository,
                              TimeSlotRepository timeSlotRepository,
                              TimetableEntryRepository timetableEntryRepository,
                              MeetingRepository meetingRepository,
                              LiveClassRepository liveClassRepository) {
        this.facultyRepository = facultyRepository;
        this.departmentRepository = departmentRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.meetingRepository = meetingRepository;
        this.liveClassRepository = liveClassRepository;
    }

    @Override
    @Transactional
    public FacultyDTO createFaculty(FacultyDTO dto) {
        if (dto.getFacultyName() == null || dto.getFacultyName().trim().isEmpty()) {
            throw new BusinessException("Faculty name cannot be empty.");
        }
        if (dto.getFacultyCode() == null || dto.getFacultyCode().trim().isEmpty()) {
            throw new BusinessException("Faculty code cannot be empty.");
        }
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new BusinessException("Faculty email cannot be empty.");
        }
        if (dto.getDepartmentId() == null) {
            throw new BusinessException("Department ID is required.");
        }

        if (facultyRepository.existsByFacultyCode(dto.getFacultyCode().trim())) {
            throw new ConflictException("Faculty code already exists: " + dto.getFacultyCode());
        }
        if (facultyRepository.existsByEmail(dto.getEmail().trim().toLowerCase())) {
            throw new ConflictException("Faculty email already in use: " + dto.getEmail());
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));

        Faculty faculty = new Faculty();
        faculty.setFacultyName(dto.getFacultyName().trim());
        faculty.setFacultyCode(dto.getFacultyCode().trim().toUpperCase());
        faculty.setEmail(dto.getEmail().trim().toLowerCase());
        faculty.setDepartment(department);
        faculty.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        Faculty saved = facultyRepository.save(faculty);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyDTO getFacultyById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + id));
        return mapToDTO(faculty);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyDTO> getAllFaculties() {
        return facultyRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FacultyDTO updateFaculty(Long id, FacultyDTO dto) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + id));

        if (dto.getFacultyCode() != null && !dto.getFacultyCode().equalsIgnoreCase(faculty.getFacultyCode())) {
            if (facultyRepository.existsByFacultyCode(dto.getFacultyCode().trim())) {
                throw new ConflictException("Faculty code already in use: " + dto.getFacultyCode());
            }
            faculty.setFacultyCode(dto.getFacultyCode().trim().toUpperCase());
        }

        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(faculty.getEmail())) {
            if (facultyRepository.existsByEmail(dto.getEmail().trim().toLowerCase())) {
                throw new ConflictException("Faculty email already in use: " + dto.getEmail());
            }
            faculty.setEmail(dto.getEmail().trim().toLowerCase());
        }

        if (dto.getFacultyName() != null && !dto.getFacultyName().trim().isEmpty()) {
            faculty.setFacultyName(dto.getFacultyName().trim());
        }

        if (dto.getDepartmentId() != null && !dto.getDepartmentId().equals(faculty.getDepartment().getDepartmentId())) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));
            faculty.setDepartment(department);
        }

        if (dto.getStatus() != null) {
            faculty.setStatus(dto.getStatus());
        }

        Faculty updated = facultyRepository.save(faculty);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteFaculty(Long id) {
        if (!facultyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Faculty not found with ID: " + id);
        }
        facultyRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyDTO getFacultyByCode(String code) {
        Faculty faculty = facultyRepository.findByFacultyCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with code: " + code));
        return mapToDTO(faculty);
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyDTO getFacultyByEmail(String email) {
        Faculty faculty = facultyRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with email: " + email));
        return mapToDTO(faculty);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyDTO> getFacultiesByDepartment(Long departmentId) {
        return facultyRepository.findByDepartment_DepartmentId(departmentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyDTO> getActiveFaculties() {
        return facultyRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyDTO> getFreeFaculty(LocalDate date, String day, Long timeSlotId, Long departmentId, Long subjectId) {
        if (day == null || day.trim().isEmpty()) {
            throw new BusinessException("Day parameter is required (e.g. Monday).");
        }
        if (timeSlotId == null) {
            throw new BusinessException("timeSlotId parameter is required.");
        }
        if (departmentId == null) {
            throw new BusinessException("departmentId parameter is required.");
        }

        TimeSlot slot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found with ID: " + timeSlotId));

        // 1. Busy faculty in timetable on this day & time slot
        List<Long> busyFromTimetable = timetableEntryRepository.findBusyFacultyIds(day.trim().toUpperCase(), timeSlotId);

        // 2. Busy faculty in scheduled meetings during this time slot
        List<Long> busyFromMeetings = List.of();
        if (date != null) {
            busyFromMeetings = meetingRepository.findFacultyIdsInMeetings(date, slot.getStartTime(), slot.getEndTime());
        }

        Set<Long> busyFacultyIds = new HashSet<>(busyFromTimetable);
        busyFacultyIds.addAll(busyFromMeetings);

        // 3. Active faculties belonging to department
        List<Faculty> deptFaculties = facultyRepository.findByDepartment_DepartmentIdAndStatus(departmentId, "ACTIVE");

        // 4. Return available ones
        return deptFaculties.stream()
                .filter(f -> !busyFacultyIds.contains(f.getFacultyId()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.example.smarttimetable.dto.FacultyMatrixDTO> getFacultyMatrix(LocalDate date, String day, Long timeSlotId, Long departmentId) {
        if (date == null) date = LocalDate.now();
        if (day == null || day.trim().isEmpty()) day = date.getDayOfWeek().name();
        String finalDay = day.trim().toUpperCase();

        TimeSlot slot = null;
        if (timeSlotId != null) {
            slot = timeSlotRepository.findById(timeSlotId).orElse(null);
        } else {
            // Live time resolution: Find slot matching current LocalTime.now()
            List<TimeSlot> allSlots = timeSlotRepository.findAll();
            allSlots.sort(Comparator.comparingInt(s -> s.getPeriodNumber() != null ? s.getPeriodNumber() : 0));
            LocalTime nowTime = LocalTime.now();
            for (TimeSlot ts : allSlots) {
                if (ts.getStartTime() != null && ts.getEndTime() != null) {
                    if (!nowTime.isBefore(ts.getStartTime()) && nowTime.isBefore(ts.getEndTime())) {
                        slot = ts;
                        break;
                    }
                }
            }
        }

        boolean isLiveMode = (timeSlotId == null);
        boolean isOutsideHours = isLiveMode && (slot == null);

        String freePeriodStr;
        java.time.format.DateTimeFormatter time12Formatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a");
        if (slot != null) {
            String startStr = slot.getStartTime() != null ? slot.getStartTime().format(time12Formatter) : "";
            String endStr = slot.getEndTime() != null ? slot.getEndTime().format(time12Formatter) : "";
            freePeriodStr = "Period " + slot.getPeriodNumber() + " (" + startStr + " – " + endStr + ")";
        } else {
            LocalTime nowTime = LocalTime.now();
            freePeriodStr = "Past 04:05 PM (" + nowTime.format(time12Formatter) + ") - College Hours Concluded";
        }

        List<Faculty> targetFaculties;
        if (departmentId != null) {
            targetFaculties = facultyRepository.findByDepartment_DepartmentId(departmentId);
        } else {
            targetFaculties = facultyRepository.findAll();
        }

        List<com.example.smarttimetable.dto.FacultyMatrixDTO> matrix = new ArrayList<>();

        for (Faculty f : targetFaculties) {
            String fStatus = "FREE";
            String currentClassDesc = null;

            if (!"ACTIVE".equalsIgnoreCase(f.getStatus())) {
                fStatus = "UNAVAILABLE";
            } else {
                // 1. Check if faculty has an active RUNNING live class right now
                List<LiveClass> runningClasses = liveClassRepository.findByTimetableEntry_Faculty_FacultyIdAndStatus(f.getFacultyId(), "RUNNING");
                if (!runningClasses.isEmpty()) {
                    fStatus = "BUSY";
                    LiveClass activeLc = runningClasses.get(0);
                    TimetableEntry lcTe = activeLc.getTimetableEntry();
                    String subj = (lcTe != null && lcTe.getSubject() != null) ? lcTe.getSubject().getSubjectName() : "Live Class";
                    String rm = (lcTe != null && lcTe.getRoom() != null) ? " (Room " + lcTe.getRoom().getRoomNumber() + ")" : "";
                    String sec = (lcTe != null && lcTe.getTimetable() != null && lcTe.getTimetable().getSection() != null) ? " [" + lcTe.getTimetable().getSection().getSectionName() + "]" : "";
                    currentClassDesc = subj + rm + sec;
                } else if (isOutsideHours) {
                    // Live mode when current time is outside college hours (> 04:05 PM or < 09:00 AM)
                    // College is concluded for the day, so no free faculty should be shown.
                    fStatus = "OFF_DUTY";
                    currentClassDesc = "College concluded for today (Classes run 09:00 AM – 04:05 PM)";
                } else if (slot != null) {
                    // 2. Check meetings
                    List<Meeting> meetings = meetingRepository.findFacultyMeetingConflicts(
                            f.getFacultyId(), date, slot.getStartTime(), slot.getEndTime(), null);
                    if (!meetings.isEmpty()) {
                        fStatus = "MEETING";
                        currentClassDesc = "Meeting: " + meetings.get(0).getTitle();
                    } else {
                        // 3. Check timetable classes for this slot
                        List<TimetableEntry> entries = timetableEntryRepository.findByFaculty_FacultyIdAndDayOfWeek(f.getFacultyId(), finalDay);
                        for (TimetableEntry te : entries) {
                            if ("ACTIVE".equalsIgnoreCase(te.getStatus()) && te.getTimeSlot() != null && te.getTimeSlot().getTimeSlotId().equals(slot.getTimeSlotId())) {
                                fStatus = "BUSY";
                                currentClassDesc = (te.getSubject() != null ? te.getSubject().getSubjectName() : "Class") +
                                        (te.getRoom() != null ? " (Room " + te.getRoom().getRoomNumber() + ")" : "") +
                                        (te.getTimetable() != null && te.getTimetable().getSection() != null ? " [" + te.getTimetable().getSection().getSectionName() + "]" : "");
                                break;
                            }
                        }
                    }
                }
            }

            int workload = timetableEntryRepository.findByFaculty_FacultyIdAndDayOfWeek(f.getFacultyId(), finalDay).size();

            matrix.add(new com.example.smarttimetable.dto.FacultyMatrixDTO(
                    f.getFacultyId(),
                    f.getFacultyName(),
                    f.getFacultyCode(),
                    f.getEmail(),
                    f.getDepartment() != null ? f.getDepartment().getDepartmentId() : null,
                    f.getDepartment() != null ? f.getDepartment().getDepartmentName() : null,
                    fStatus,
                    currentClassDesc,
                    freePeriodStr,
                    workload
            ));
        }

        return matrix;
    }

    private FacultyDTO mapToDTO(Faculty f) {
        FacultyDTO dto = new FacultyDTO(
                f.getFacultyId(),
                f.getFacultyName(),
                f.getFacultyCode(),
                f.getEmail(),
                f.getDepartment() != null ? f.getDepartment().getDepartmentId() : null,
                f.getDepartment() != null ? f.getDepartment().getDepartmentName() : null,
                f.getStatus()
        );
        if (f.getDepartment() != null) {
            dto.setDepartmentCode(f.getDepartment().getDepartmentCode());
        }
        return dto;
    }
}
