package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.DashboardStatsDTO;
import com.example.smarttimetable.repository.*;
import com.example.smarttimetable.service.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final FacultyRepository facultyRepository;
    private final RoomRepository roomRepository;
    private final SubjectRepository subjectRepository;
    private final SectionRepository sectionRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final LiveClassRepository liveClassRepository;
    private final MeetingRepository meetingRepository;

    public DashboardServiceImpl(FacultyRepository facultyRepository,
                                RoomRepository roomRepository,
                                SubjectRepository subjectRepository,
                                SectionRepository sectionRepository,
                                TimetableEntryRepository timetableEntryRepository,
                                LiveClassRepository liveClassRepository,
                                MeetingRepository meetingRepository) {
        this.facultyRepository = facultyRepository;
        this.roomRepository = roomRepository;
        this.subjectRepository = subjectRepository;
        this.sectionRepository = sectionRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.liveClassRepository = liveClassRepository;
        this.meetingRepository = meetingRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        long totalFaculty = facultyRepository.count();
        long totalRooms = roomRepository.count();
        long totalSubjects = subjectRepository.count();
        long totalSections = sectionRepository.count();
        long totalTimetableEntries = timetableEntryRepository.count();
        long activeClasses = liveClassRepository.countByStatus("RUNNING");
        long upcomingMeetings = meetingRepository.countByDateGreaterThanEqualAndStatus(LocalDate.now(), "SCHEDULED");

        return new DashboardStatsDTO(
                totalFaculty,
                totalRooms,
                totalSubjects,
                totalSections,
                totalTimetableEntries,
                activeClasses,
                upcomingMeetings
        );
    }
}
