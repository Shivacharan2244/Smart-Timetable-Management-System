package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.TimetableEntryDTO;
import com.example.smarttimetable.entity.*;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ConflictException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.*;
import com.example.smarttimetable.service.TimetableEntryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimetableEntryServiceImpl implements TimetableEntryService {

    private final TimetableEntryRepository timetableEntryRepository;
    private final TimetableRepository timetableRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final RoomRepository roomRepository;

    public TimetableEntryServiceImpl(TimetableEntryRepository timetableEntryRepository,
                                     TimetableRepository timetableRepository,
                                     TimeSlotRepository timeSlotRepository,
                                     SubjectRepository subjectRepository,
                                     FacultyRepository facultyRepository,
                                     RoomRepository roomRepository) {
        this.timetableEntryRepository = timetableEntryRepository;
        this.timetableRepository = timetableRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.subjectRepository = subjectRepository;
        this.facultyRepository = facultyRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    @Transactional
    public TimetableEntryDTO createEntry(TimetableEntryDTO dto) {
        validateEntryData(dto);

        Timetable timetable = timetableRepository.findById(dto.getTimetableId())
                .orElseThrow(() -> new ResourceNotFoundException("Timetable not found with ID: " + dto.getTimetableId()));

        TimeSlot timeSlot = timeSlotRepository.findById(dto.getTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found with ID: " + dto.getTimeSlotId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + dto.getSubjectId()));

        Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + dto.getFacultyId()));

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + dto.getRoomId()));

        String dayOfWeek = dto.getDayOfWeek().trim().toUpperCase();
        Long sectionId = timetable.getSection().getSectionId();

        // Perform Conflict Checks (no entry excluded on creation)
        checkConflicts(timetable.getTimetableId(), dayOfWeek, timeSlot.getTimeSlotId(),
                faculty.getFacultyId(), room.getRoomId(), sectionId, null);

        TimetableEntry entry = new TimetableEntry();
        entry.setTimetable(timetable);
        entry.setDayOfWeek(dayOfWeek);
        entry.setTimeSlot(timeSlot);
        entry.setSubject(subject);
        entry.setFaculty(faculty);
        entry.setRoom(room);
        entry.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        TimetableEntry saved = timetableEntryRepository.save(entry);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TimetableEntryDTO getEntryById(Long id) {
        TimetableEntry entry = timetableEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found with ID: " + id));
        return mapToDTO(entry);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getAllEntries() {
        return timetableEntryRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TimetableEntryDTO updateEntry(Long id, TimetableEntryDTO dto) {
        TimetableEntry entry = timetableEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found with ID: " + id));

        validateEntryData(dto);

        Timetable timetable = timetableRepository.findById(dto.getTimetableId())
                .orElseThrow(() -> new ResourceNotFoundException("Timetable not found with ID: " + dto.getTimetableId()));

        TimeSlot timeSlot = timeSlotRepository.findById(dto.getTimeSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found with ID: " + dto.getTimeSlotId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + dto.getSubjectId()));

        Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + dto.getFacultyId()));

        Room room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + dto.getRoomId()));

        String dayOfWeek = dto.getDayOfWeek().trim().toUpperCase();
        Long sectionId = timetable.getSection().getSectionId();

        // Perform Conflict Checks (excluding current entry ID)
        checkConflicts(timetable.getTimetableId(), dayOfWeek, timeSlot.getTimeSlotId(),
                faculty.getFacultyId(), room.getRoomId(), sectionId, id);

        entry.setTimetable(timetable);
        entry.setDayOfWeek(dayOfWeek);
        entry.setTimeSlot(timeSlot);
        entry.setSubject(subject);
        entry.setFaculty(faculty);
        entry.setRoom(room);
        if (dto.getStatus() != null) {
            entry.setStatus(dto.getStatus());
        }

        TimetableEntry updated = timetableEntryRepository.save(entry);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteEntry(Long id) {
        if (!timetableEntryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Timetable entry not found with ID: " + id);
        }
        timetableEntryRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getEntriesByTimetable(Long timetableId) {
        return timetableEntryRepository.findByTimetable_TimetableId(timetableId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getEntriesByFaculty(Long facultyId) {
        return timetableEntryRepository.findByFaculty_FacultyId(facultyId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getEntriesByRoom(Long roomId) {
        return timetableEntryRepository.findByRoom_RoomId(roomId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getEntriesByRoom(Long roomId, String dayOfWeek) {
        if (dayOfWeek == null || dayOfWeek.trim().isEmpty()) {
            return getEntriesByRoom(roomId);
        }
        return timetableEntryRepository.findByRoom_RoomIdAndDayOfWeek(roomId, dayOfWeek.trim().toUpperCase()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getEntriesBySection(Long sectionId) {
        return timetableEntryRepository.findByTimetable_Section_SectionId(sectionId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getEntriesBySection(Long sectionId, String dayOfWeek) {
        if (dayOfWeek == null || dayOfWeek.trim().isEmpty()) {
            return getEntriesBySection(sectionId);
        }
        return timetableEntryRepository.findByTimetable_Section_SectionIdAndDayOfWeek(sectionId, dayOfWeek.trim().toUpperCase()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getEntriesByFacultyAndDay(Long facultyId, String dayOfWeek) {
        return timetableEntryRepository.findByFaculty_FacultyIdAndDayOfWeek(facultyId, dayOfWeek.trim().toUpperCase()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimetableEntryDTO> getEntriesByDay(String dayOfWeek) {
        return timetableEntryRepository.findByDayOfWeek(dayOfWeek.trim().toUpperCase()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private void checkConflicts(Long timetableId, String dayOfWeek, Long timeSlotId,
                                Long facultyId, Long roomId, Long sectionId, Long excludeEntryId) {
        // 1. Duplicate check
        if (timetableEntryRepository.isDuplicateEntry(timetableId, dayOfWeek, timeSlotId, excludeEntryId)) {
            throw new ConflictException("This timetable entry already exists.");
        }

        // 2. Faculty conflict check
        if (timetableEntryRepository.hasFacultyConflict(facultyId, dayOfWeek, timeSlotId, excludeEntryId)) {
            throw new ConflictException("Faculty is already assigned to another class during this time.");
        }

        // 3. Room conflict check
        if (timetableEntryRepository.hasRoomConflict(roomId, dayOfWeek, timeSlotId, excludeEntryId)) {
            throw new ConflictException("Room is already occupied during this time.");
        }

        // 4. Section conflict check
        if (timetableEntryRepository.hasSectionConflict(sectionId, dayOfWeek, timeSlotId, excludeEntryId)) {
            throw new ConflictException("Section already has another class during this time.");
        }
    }

    private void validateEntryData(TimetableEntryDTO dto) {
        if (dto.getTimetableId() == null) {
            throw new BusinessException("Timetable ID is required.");
        }
        if (dto.getDayOfWeek() == null || dto.getDayOfWeek().trim().isEmpty()) {
            throw new BusinessException("Day of week is required.");
        }
        if (dto.getTimeSlotId() == null) {
            throw new BusinessException("TimeSlot ID is required.");
        }
        if (dto.getSubjectId() == null) {
            throw new BusinessException("Subject ID is required.");
        }
        if (dto.getFacultyId() == null) {
            throw new BusinessException("Faculty ID is required.");
        }
        if (dto.getRoomId() == null) {
            throw new BusinessException("Room ID is required.");
        }
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
}
