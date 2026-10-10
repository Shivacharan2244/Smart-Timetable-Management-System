package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.LiveClassDTO;
import com.example.smarttimetable.entity.LiveClass;
import com.example.smarttimetable.entity.Room;
import com.example.smarttimetable.entity.TimetableEntry;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ConflictException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.LiveClassRepository;
import com.example.smarttimetable.repository.RoomRepository;
import com.example.smarttimetable.repository.TimetableEntryRepository;
import com.example.smarttimetable.service.LiveClassService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LiveClassServiceImpl implements LiveClassService {

    private final LiveClassRepository liveClassRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final RoomRepository roomRepository;

    public LiveClassServiceImpl(LiveClassRepository liveClassRepository,
                                TimetableEntryRepository timetableEntryRepository,
                                RoomRepository roomRepository) {
        this.liveClassRepository = liveClassRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    @Transactional
    public LiveClassDTO createLiveClass(LiveClassDTO dto) {
        if (dto.getTimetableEntryId() == null) {
            throw new BusinessException("Timetable entry ID is required.");
        }
        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            throw new BusinessException("Start time and end time are required.");
        }

        TimetableEntry entry = timetableEntryRepository.findById(dto.getTimetableEntryId())
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry not found with ID: " + dto.getTimetableEntryId()));

        LiveClass liveClass = new LiveClass();
        liveClass.setTimetableEntry(entry);
        liveClass.setStartTime(dto.getStartTime());
        liveClass.setEndTime(dto.getEndTime());
        liveClass.setStatus(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "UPCOMING");
        liveClass.setRemarks(dto.getRemarks());

        LiveClass saved = liveClassRepository.save(liveClass);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public LiveClassDTO getLiveClassById(Long id) {
        LiveClass liveClass = liveClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Live class not found with ID: " + id));
        return mapToDTO(liveClass);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LiveClassDTO> getAllLiveClasses() {
        return liveClassRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LiveClassDTO> getTodayLiveClasses() {
        String today = LocalDate.now().getDayOfWeek().name();
        return liveClassRepository.findAll().stream()
                .filter(lc -> lc.getTimetableEntry() != null && today.equalsIgnoreCase(lc.getTimetableEntry().getDayOfWeek()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LiveClassDTO> getRunningLiveClasses() {
        return liveClassRepository.findByStatus("RUNNING").stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LiveClassDTO> getUpcomingLiveClasses() {
        return liveClassRepository.findByStatus("UPCOMING").stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LiveClassDTO startClass(Long id) {
        LiveClass liveClass = liveClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Live class not found with ID: " + id));

        liveClass.setStatus("RUNNING");
        if (liveClass.getActualStartTime() == null) {
            liveClass.setActualStartTime(LocalTime.now());
        }

        LiveClass updated = liveClassRepository.save(liveClass);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public LiveClassDTO endClass(Long id) {
        LiveClass liveClass = liveClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Live class not found with ID: " + id));

        liveClass.setStatus("COMPLETED");
        if (liveClass.getActualEndTime() == null) {
            liveClass.setActualEndTime(LocalTime.now());
        }

        LiveClass updated = liveClassRepository.save(liveClass);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public LiveClassDTO cancelClass(Long id, String reason) {
        LiveClass liveClass = liveClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Live class not found with ID: " + id));

        liveClass.setStatus("CANCELLED");
        String existingRemarks = liveClass.getRemarks() != null ? liveClass.getRemarks() + " | " : "";
        liveClass.setRemarks(existingRemarks + "Cancelled: " + (reason != null ? reason : "Administrative cancellation"));

        LiveClass updated = liveClassRepository.save(liveClass);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public LiveClassDTO changeRoom(Long id, Long newRoomId, String reason) {
        LiveClass liveClass = liveClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Live class not found with ID: " + id));

        Room newRoom = roomRepository.findById(newRoomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + newRoomId));

        TimetableEntry entry = liveClass.getTimetableEntry();
        if (entry != null) {
            // Check room conflict
            if (timetableEntryRepository.hasRoomConflict(newRoomId, entry.getDayOfWeek(),
                    entry.getTimeSlot().getTimeSlotId(), entry.getEntryId())) {
                throw new ConflictException("Room " + newRoom.getRoomNumber() + " is already occupied during this time.");
            }
            entry.setRoom(newRoom);
            timetableEntryRepository.save(entry);
        }

        String existingRemarks = liveClass.getRemarks() != null ? liveClass.getRemarks() + " | " : "";
        liveClass.setRemarks(existingRemarks + "Room changed to " + newRoom.getRoomNumber() + (reason != null ? " (" + reason + ")" : ""));

        LiveClass updated = liveClassRepository.save(liveClass);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public List<LiveClassDTO> syncTodayClasses() {
        String today = LocalDate.now().getDayOfWeek().name();
        List<TimetableEntry> entries = timetableEntryRepository.findByDayOfWeek(today);
        List<LiveClass> existing = liveClassRepository.findAll();

        // Group existing by entryId to handle and remove any duplicates
        java.util.Map<Long, List<LiveClass>> existingByEntry = existing.stream()
                .filter(lc -> lc.getTimetableEntry() != null)
                .collect(Collectors.groupingBy(lc -> lc.getTimetableEntry().getEntryId()));

        LocalTime now = LocalTime.now();

        for (TimetableEntry te : entries) {
            if (!"ACTIVE".equalsIgnoreCase(te.getStatus())) {
                continue;
            }

            LocalTime start = te.getTimeSlot() != null ? te.getTimeSlot().getStartTime() : LocalTime.of(9, 0);
            LocalTime end = te.getTimeSlot() != null ? te.getTimeSlot().getEndTime() : LocalTime.of(10, 0);

            List<LiveClass> list = existingByEntry.get(te.getEntryId());
            LiveClass lc;
            if (list != null && !list.isEmpty()) {
                lc = list.get(0);
                // Clean up any extra duplicates if present
                if (list.size() > 1) {
                    for (int i = 1; i < list.size(); i++) {
                        liveClassRepository.delete(list.get(i));
                    }
                }
            } else {
                lc = new LiveClass();
                lc.setTimetableEntry(te);
                lc.setStartTime(start);
                lc.setEndTime(end);
            }

            // Update status dynamically if not manually cancelled
            if (!"CANCELLED".equalsIgnoreCase(lc.getStatus())) {
                if (now.isAfter(start) && now.isBefore(end)) {
                    lc.setStatus("RUNNING");
                    if (lc.getActualStartTime() == null) lc.setActualStartTime(start);
                } else if (now.isAfter(end)) {
                    lc.setStatus("COMPLETED");
                    if (lc.getActualStartTime() == null) lc.setActualStartTime(start);
                    if (lc.getActualEndTime() == null) lc.setActualEndTime(end);
                } else {
                    lc.setStatus("UPCOMING");
                }
            }

            liveClassRepository.save(lc);
        }

        // Return all today's live classes
        return getTodayLiveClasses();
    }

    private LiveClassDTO mapToDTO(LiveClass lc) {
        LiveClassDTO dto = new LiveClassDTO();
        dto.setLiveClassId(lc.getLiveClassId());
        dto.setStartTime(lc.getStartTime());
        dto.setEndTime(lc.getEndTime());
        dto.setStatus(lc.getStatus());
        dto.setActualStartTime(lc.getActualStartTime());
        dto.setActualEndTime(lc.getActualEndTime());
        dto.setRemarks(lc.getRemarks());

        if (lc.getTimetableEntry() != null) {
            TimetableEntry te = lc.getTimetableEntry();
            dto.setTimetableEntryId(te.getEntryId());

            if (te.getSubject() != null) {
                dto.setSubjectName(te.getSubject().getSubjectName());
                dto.setSubjectCode(te.getSubject().getSubjectCode());
            }
            if (te.getFaculty() != null) {
                dto.setFacultyName(te.getFaculty().getFacultyName());
            }
            if (te.getRoom() != null) {
                dto.setRoomNumber(te.getRoom().getRoomNumber());
            }
            if (te.getTimetable() != null && te.getTimetable().getSection() != null) {
                dto.setSectionName(te.getTimetable().getSection().getSectionName());
            }
        }

        return dto;
    }
}
