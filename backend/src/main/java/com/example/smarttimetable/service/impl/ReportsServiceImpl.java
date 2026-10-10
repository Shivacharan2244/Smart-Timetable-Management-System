package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.FacultyWorkloadReportDTO;
import com.example.smarttimetable.dto.RoomUtilizationReportDTO;
import com.example.smarttimetable.entity.Faculty;
import com.example.smarttimetable.entity.Room;
import com.example.smarttimetable.entity.TimetableEntry;
import com.example.smarttimetable.repository.*;
import com.example.smarttimetable.service.ReportsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ReportsServiceImpl implements ReportsService {

    private final FacultyRepository facultyRepository;
    private final RoomRepository roomRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final MeetingRepository meetingRepository;
    private final LiveClassRepository liveClassRepository;

    public ReportsServiceImpl(FacultyRepository facultyRepository,
                              RoomRepository roomRepository,
                              TimetableEntryRepository timetableEntryRepository,
                              MeetingRepository meetingRepository,
                              LiveClassRepository liveClassRepository) {
        this.facultyRepository = facultyRepository;
        this.roomRepository = roomRepository;
        this.timetableEntryRepository = timetableEntryRepository;
        this.meetingRepository = meetingRepository;
        this.liveClassRepository = liveClassRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyWorkloadReportDTO> getFacultyWorkloadReport() {
        List<Faculty> faculties = facultyRepository.findAll();
        List<FacultyWorkloadReportDTO> list = new ArrayList<>();

        for (Faculty f : faculties) {
            List<TimetableEntry> entries = timetableEntryRepository.findByFaculty_FacultyId(f.getFacultyId());
            long activeCount = entries.stream().filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus())).count();
            double hours = activeCount * 1.0; // 1 hour per period

            list.add(new FacultyWorkloadReportDTO(
                    f.getFacultyId(),
                    f.getFacultyName(),
                    f.getFacultyCode(),
                    f.getDepartment() != null ? f.getDepartment().getDepartmentName() : "General",
                    (int) activeCount,
                    hours
            ));
        }

        list.sort((a, b) -> Integer.compare(b.getClassCount(), a.getClassCount()));
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomUtilizationReportDTO> getRoomUtilizationReport() {
        List<Room> rooms = roomRepository.findAll();
        List<RoomUtilizationReportDTO> list = new ArrayList<>();

        for (Room r : rooms) {
            List<TimetableEntry> entries = timetableEntryRepository.findByRoom_RoomId(r.getRoomId());
            long activeCount = entries.stream().filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus())).count();
            double occupiedHours = activeCount * 1.0;
            double maxWeeklyHours = 48.0; // 6 days * 8 slots
            double percentage = (occupiedHours / maxWeeklyHours) * 100.0;
            if (percentage > 100.0) percentage = 100.0;

            list.add(new RoomUtilizationReportDTO(
                    r.getRoomId(),
                    r.getRoomNumber(),
                    r.getRoomType(),
                    r.getCapacity(),
                    (int) activeCount,
                    occupiedHours,
                    percentage
            ));
        }

        list.sort((a, b) -> Double.compare(b.getUtilizationPercentage(), a.getUtilizationPercentage()));
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getReportsOverview() {
        List<FacultyWorkloadReportDTO> workload = getFacultyWorkloadReport();
        List<RoomUtilizationReportDTO> utilization = getRoomUtilizationReport();

        double totalHours = workload.stream().mapToDouble(FacultyWorkloadReportDTO::getTotalHours).sum();
        double avgHoursPerFaculty = workload.isEmpty() ? 0 : totalHours / workload.size();

        double avgRoomUtil = utilization.isEmpty() ? 0 :
                utilization.stream().mapToDouble(RoomUtilizationReportDTO::getUtilizationPercentage).average().orElse(0.0);

        Map<String, Object> map = new HashMap<>();
        map.put("totalFaculties", workload.size());
        map.put("totalRooms", utilization.size());
        map.put("totalScheduledHours", totalHours);
        map.put("averageFacultyWorkloadHours", Math.round(avgHoursPerFaculty * 10.0) / 10.0);
        map.put("averageRoomUtilizationPercent", Math.round(avgRoomUtil * 10.0) / 10.0);
        map.put("totalMeetings", meetingRepository.count());
        map.put("totalLiveClasses", liveClassRepository.count());

        return map;
    }
}
