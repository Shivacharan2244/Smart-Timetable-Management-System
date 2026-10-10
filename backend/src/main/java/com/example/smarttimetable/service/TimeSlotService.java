package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.TimeSlotDTO;

import java.util.List;

public interface TimeSlotService {
    TimeSlotDTO createTimeSlot(TimeSlotDTO dto);
    TimeSlotDTO getTimeSlotById(Long id);
    List<TimeSlotDTO> getAllTimeSlots();
    TimeSlotDTO updateTimeSlot(Long id, TimeSlotDTO dto);
    void deleteTimeSlot(Long id);
    List<TimeSlotDTO> getTimeSlotsByDayOrder(String dayOrder);
    List<TimeSlotDTO> getActiveTimeSlots();
}
