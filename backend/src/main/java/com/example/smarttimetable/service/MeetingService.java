package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.MeetingDTO;

import java.time.LocalDate;
import java.util.List;

import com.example.smarttimetable.dto.SuggestedSlotDTO;
import java.time.LocalTime;

public interface MeetingService {
    MeetingDTO createMeeting(MeetingDTO dto);
    MeetingDTO getMeetingById(Long id);
    List<MeetingDTO> getAllMeetings();
    MeetingDTO updateMeeting(Long id, MeetingDTO dto);
    void cancelMeeting(Long id);
    List<MeetingDTO> getMeetingsByFaculty(Long facultyId);
    List<MeetingDTO> getMeetingsByRoom(Long roomId);
    List<MeetingDTO> getMeetingsByDate(LocalDate date);
    List<MeetingDTO> getUpcomingMeetings();
    List<SuggestedSlotDTO> getSuggestedSlots(Long facultyId, LocalDate date, LocalTime rangeStart,
                                             LocalTime rangeEnd, int durationMinutes, Long roomId);
}
