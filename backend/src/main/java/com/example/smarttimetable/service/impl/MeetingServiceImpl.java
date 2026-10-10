package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.MeetingDTO;
import com.example.smarttimetable.dto.SuggestedSlotDTO;
import com.example.smarttimetable.entity.Faculty;
import com.example.smarttimetable.entity.Meeting;
import com.example.smarttimetable.entity.Room;
import com.example.smarttimetable.entity.TimetableEntry;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ConflictException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.FacultyRepository;
import com.example.smarttimetable.repository.MeetingRepository;
import com.example.smarttimetable.repository.RoomRepository;
import com.example.smarttimetable.repository.TimetableEntryRepository;
import com.example.smarttimetable.service.MeetingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingServiceImpl implements MeetingService {

    private final MeetingRepository meetingRepository;
    private final FacultyRepository facultyRepository;
    private final RoomRepository roomRepository;
    private final TimetableEntryRepository timetableEntryRepository;

    public MeetingServiceImpl(MeetingRepository meetingRepository,
                              FacultyRepository facultyRepository,
                              RoomRepository roomRepository,
                              TimetableEntryRepository timetableEntryRepository) {
        this.meetingRepository = meetingRepository;
        this.facultyRepository = facultyRepository;
        this.roomRepository = roomRepository;
        this.timetableEntryRepository = timetableEntryRepository;
    }

    @Override
    @Transactional
    public MeetingDTO createMeeting(MeetingDTO dto) {
        validateMeetingTimes(dto);

        Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + dto.getFacultyId()));

        Room room = null;
        if (dto.getRoomId() != null) {
            room = roomRepository.findById(dto.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + dto.getRoomId()));
        }

        // Perform meeting conflict checks (no meeting excluded on creation)
        checkMeetingConflicts(faculty.getFacultyId(), room != null ? room.getRoomId() : null,
                dto.getDate(), dto.getStartTime(), dto.getEndTime(), null);

        Meeting meeting = new Meeting();
        meeting.setTitle(dto.getTitle().trim());
        meeting.setDate(dto.getDate());
        meeting.setStartTime(dto.getStartTime());
        meeting.setEndTime(dto.getEndTime());
        meeting.setFaculty(faculty);
        meeting.setRoom(room);
        meeting.setDescription(dto.getDescription());
        meeting.setStatus(dto.getStatus() != null ? dto.getStatus() : "SCHEDULED");

        Meeting saved = meetingRepository.save(meeting);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MeetingDTO getMeetingById(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with ID: " + id));
        return mapToDTO(meeting);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MeetingDTO> getAllMeetings() {
        return meetingRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MeetingDTO updateMeeting(Long id, MeetingDTO dto) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with ID: " + id));

        validateMeetingTimes(dto);

        Faculty faculty = facultyRepository.findById(dto.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + dto.getFacultyId()));

        Room room = null;
        if (dto.getRoomId() != null) {
            room = roomRepository.findById(dto.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + dto.getRoomId()));
        }

        // Perform meeting conflict checks (excluding current meeting ID)
        checkMeetingConflicts(faculty.getFacultyId(), room != null ? room.getRoomId() : null,
                dto.getDate(), dto.getStartTime(), dto.getEndTime(), id);

        meeting.setTitle(dto.getTitle().trim());
        meeting.setDate(dto.getDate());
        meeting.setStartTime(dto.getStartTime());
        meeting.setEndTime(dto.getEndTime());
        meeting.setFaculty(faculty);
        meeting.setRoom(room);
        meeting.setDescription(dto.getDescription());
        if (dto.getStatus() != null) {
            meeting.setStatus(dto.getStatus());
        }

        Meeting updated = meetingRepository.save(meeting);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void cancelMeeting(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found with ID: " + id));
        meeting.setStatus("CANCELLED");
        meetingRepository.save(meeting);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetingsByFaculty(Long facultyId) {
        return meetingRepository.findByFaculty_FacultyId(facultyId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetingsByRoom(Long roomId) {
        return meetingRepository.findByRoom_RoomId(roomId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetingsByDate(LocalDate date) {
        return meetingRepository.findByDate(date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MeetingDTO> getUpcomingMeetings() {
        return meetingRepository.findAll().stream()
                .filter(m -> !"CANCELLED".equalsIgnoreCase(m.getStatus()) && !m.getDate().isBefore(LocalDate.now()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuggestedSlotDTO> getSuggestedSlots(Long facultyId, LocalDate date, LocalTime rangeStart,
                                                    LocalTime rangeEnd, int durationMinutes, Long roomId) {
        if (facultyId == null) {
            throw new BusinessException("Faculty ID is required for slot suggestions.");
        }
        if (date == null) {
            date = LocalDate.now();
        }
        if (rangeStart == null) rangeStart = LocalTime.of(9, 0);
        if (rangeEnd == null) rangeEnd = LocalTime.of(17, 0);
        if (durationMinutes <= 0) durationMinutes = 30;

        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + facultyId));

        Room room = null;
        if (roomId != null) {
            room = roomRepository.findById(roomId).orElse(null);
        }

        String dayOfWeek = date.getDayOfWeek().name();
        List<TimetableEntry> facultyClasses = timetableEntryRepository.findByFaculty_FacultyIdAndDayOfWeek(facultyId, dayOfWeek);
        List<Meeting> facultyMeetings = meetingRepository.findByFaculty_FacultyId(facultyId);

        List<TimetableEntry> roomClasses = (room != null)
                ? timetableEntryRepository.findByRoom_RoomIdAndDayOfWeek(room.getRoomId(), dayOfWeek)
                : List.of();
        List<Meeting> roomMeetings = (room != null)
                ? meetingRepository.findByRoom_RoomId(room.getRoomId())
                : List.of();

        List<SuggestedSlotDTO> suggestions = new java.util.ArrayList<>();
        LocalTime current = rangeStart;

        while (!current.plusMinutes(durationMinutes).isAfter(rangeEnd)) {
            LocalTime slotStart = current;
            LocalTime slotEnd = current.plusMinutes(durationMinutes);

            boolean hasConflict = false;

            // Check faculty classes
            for (TimetableEntry te : facultyClasses) {
                if ("ACTIVE".equalsIgnoreCase(te.getStatus()) && te.getTimeSlot() != null) {
                    if (te.getTimeSlot().getStartTime().isBefore(slotEnd) && te.getTimeSlot().getEndTime().isAfter(slotStart)) {
                        hasConflict = true;
                        break;
                    }
                }
            }

            // Check faculty meetings
            if (!hasConflict) {
                for (Meeting m : facultyMeetings) {
                    if (!"CANCELLED".equalsIgnoreCase(m.getStatus()) && date.equals(m.getDate())) {
                        if (m.getStartTime().isBefore(slotEnd) && m.getEndTime().isAfter(slotStart)) {
                            hasConflict = true;
                            break;
                        }
                    }
                }
            }

            // Check room classes & meetings
            if (!hasConflict && room != null) {
                for (TimetableEntry te : roomClasses) {
                    if ("ACTIVE".equalsIgnoreCase(te.getStatus()) && te.getTimeSlot() != null) {
                        if (te.getTimeSlot().getStartTime().isBefore(slotEnd) && te.getTimeSlot().getEndTime().isAfter(slotStart)) {
                            hasConflict = true;
                            break;
                        }
                    }
                }
                if (!hasConflict) {
                    for (Meeting m : roomMeetings) {
                        if (!"CANCELLED".equalsIgnoreCase(m.getStatus()) && date.equals(m.getDate())) {
                            if (m.getStartTime().isBefore(slotEnd) && m.getEndTime().isAfter(slotStart)) {
                                hasConflict = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (!hasConflict) {
                suggestions.add(new SuggestedSlotDTO(slotStart, slotEnd, durationMinutes,
                        faculty.getFacultyName(), room != null ? room.getRoomNumber() : null));
            }

            current = current.plusMinutes(30);
        }

        return suggestions;
    }

    private void checkMeetingConflicts(Long facultyId, Long roomId, LocalDate date,
                                       LocalTime startTime, LocalTime endTime, Long excludeMeetingId) {
        java.time.format.DateTimeFormatter tf = java.time.format.DateTimeFormatter.ofPattern("hh:mm a");

        // 1. Check existing meeting overlaps for Faculty
        if (meetingRepository.hasFacultyMeetingConflict(facultyId, date, startTime, endTime, excludeMeetingId)) {
            throw new ConflictException("Meeting Conflict: The selected faculty member already has another meeting scheduled during this time.");
        }

        // 2. Check timetable class conflicts for Faculty on this day of week
        String dayOfWeek = date.getDayOfWeek().name();
        List<TimetableEntry> facultyClasses = timetableEntryRepository.findByFaculty_FacultyIdAndDayOfWeek(facultyId, dayOfWeek);
        for (TimetableEntry te : facultyClasses) {
            if ("ACTIVE".equalsIgnoreCase(te.getStatus()) && te.getTimeSlot() != null) {
                if (te.getTimeSlot().getStartTime().isBefore(endTime) && te.getTimeSlot().getEndTime().isAfter(startTime)) {
                    throw new ConflictException("Meeting Conflict: The selected faculty member has a class from " +
                            te.getTimeSlot().getStartTime().format(tf) + " to " + te.getTimeSlot().getEndTime().format(tf) + ".");
                }
            }
        }

        // 3. Check Room conflicts if a room is designated
        if (roomId != null) {
            if (meetingRepository.hasRoomMeetingConflict(roomId, date, startTime, endTime, excludeMeetingId)) {
                throw new ConflictException("Room Conflict: Room is already occupied by another meeting during the selected time.");
            }

            List<TimetableEntry> roomClasses = timetableEntryRepository.findByRoom_RoomIdAndDayOfWeek(roomId, dayOfWeek);
            for (TimetableEntry te : roomClasses) {
                if ("ACTIVE".equalsIgnoreCase(te.getStatus()) && te.getTimeSlot() != null) {
                    if (te.getTimeSlot().getStartTime().isBefore(endTime) && te.getTimeSlot().getEndTime().isAfter(startTime)) {
                        throw new ConflictException("Room Conflict: Room is already occupied by a class from " +
                                te.getTimeSlot().getStartTime().format(tf) + " to " + te.getTimeSlot().getEndTime().format(tf) + ".");
                    }
                }
            }
        }
    }

    private void validateMeetingTimes(MeetingDTO dto) {
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new BusinessException("Meeting title is required.");
        }
        if (dto.getDate() == null) {
            throw new BusinessException("Meeting date is required.");
        }
        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            throw new BusinessException("Meeting start and end times are required.");
        }
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new BusinessException("Meeting start time must be strictly before end time.");
        }
        if (dto.getFacultyId() == null) {
            throw new BusinessException("Faculty ID is required for meeting.");
        }
    }

    private MeetingDTO mapToDTO(Meeting m) {
        MeetingDTO dto = new MeetingDTO();
        dto.setMeetingId(m.getMeetingId());
        dto.setTitle(m.getTitle());
        dto.setDate(m.getDate());
        dto.setStartTime(m.getStartTime());
        dto.setEndTime(m.getEndTime());

        if (m.getFaculty() != null) {
            dto.setFacultyId(m.getFaculty().getFacultyId());
            dto.setFacultyName(m.getFaculty().getFacultyName());
            dto.setFacultyCode(m.getFaculty().getFacultyCode());
        }

        if (m.getRoom() != null) {
            dto.setRoomId(m.getRoom().getRoomId());
            dto.setRoomNumber(m.getRoom().getRoomNumber());
            dto.setRoomName(m.getRoom().getRoomName());
        }

        dto.setDescription(m.getDescription());
        dto.setStatus(m.getStatus());
        return dto;
    }
}
