package com.example.smarttimetable.service.impl;

import com.example.smarttimetable.dto.TimeSlotDTO;
import com.example.smarttimetable.entity.TimeSlot;
import com.example.smarttimetable.exception.BusinessException;
import com.example.smarttimetable.exception.ConflictException;
import com.example.smarttimetable.exception.ResourceNotFoundException;
import com.example.smarttimetable.repository.TimeSlotRepository;
import com.example.smarttimetable.service.TimeSlotService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimeSlotServiceImpl implements TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;

    public TimeSlotServiceImpl(TimeSlotRepository timeSlotRepository) {
        this.timeSlotRepository = timeSlotRepository;
    }

    @Override
    @Transactional
    public TimeSlotDTO createTimeSlot(TimeSlotDTO dto) {
        validateTimeSlot(dto);

        if (timeSlotRepository.existsByDayOrderAndPeriodNumber(dto.getDayOrder().trim(), dto.getPeriodNumber())) {
            throw new ConflictException("TimeSlot already exists for day '" + dto.getDayOrder() + "' and period " + dto.getPeriodNumber());
        }

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setDayOrder(dto.getDayOrder().trim());
        timeSlot.setPeriodNumber(dto.getPeriodNumber());
        timeSlot.setStartTime(dto.getStartTime());
        timeSlot.setEndTime(dto.getEndTime());
        timeSlot.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        TimeSlot saved = timeSlotRepository.save(timeSlot);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TimeSlotDTO getTimeSlotById(Long id) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found with ID: " + id));
        return mapToDTO(timeSlot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotDTO> getAllTimeSlots() {
        return timeSlotRepository.findAllByOrderByPeriodNumberAsc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TimeSlotDTO updateTimeSlot(Long id, TimeSlotDTO dto) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TimeSlot not found with ID: " + id));

        validateTimeSlot(dto);

        String newDayOrder = dto.getDayOrder().trim();
        Integer newPeriod = dto.getPeriodNumber();

        if (!newDayOrder.equalsIgnoreCase(timeSlot.getDayOrder()) || !newPeriod.equals(timeSlot.getPeriodNumber())) {
            if (timeSlotRepository.existsByDayOrderAndPeriodNumber(newDayOrder, newPeriod)) {
                throw new ConflictException("TimeSlot already exists for day '" + newDayOrder + "' and period " + newPeriod);
            }
            timeSlot.setDayOrder(newDayOrder);
            timeSlot.setPeriodNumber(newPeriod);
        }

        timeSlot.setStartTime(dto.getStartTime());
        timeSlot.setEndTime(dto.getEndTime());
        if (dto.getStatus() != null) {
            timeSlot.setStatus(dto.getStatus());
        }

        TimeSlot updated = timeSlotRepository.save(timeSlot);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteTimeSlot(Long id) {
        if (!timeSlotRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. TimeSlot not found with ID: " + id);
        }
        timeSlotRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotDTO> getTimeSlotsByDayOrder(String dayOrder) {
        return timeSlotRepository.findByDayOrderOrderByPeriodNumberAsc(dayOrder).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotDTO> getActiveTimeSlots() {
        return timeSlotRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private void validateTimeSlot(TimeSlotDTO dto) {
        if (dto.getDayOrder() == null || dto.getDayOrder().trim().isEmpty()) {
            throw new BusinessException("Day order cannot be empty.");
        }
        if (dto.getPeriodNumber() == null || dto.getPeriodNumber() < 1) {
            throw new BusinessException("Period number must be a positive integer.");
        }
        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            throw new BusinessException("Start time and end time are both required.");
        }
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new BusinessException("Start time must be strictly before end time.");
        }
    }

    private TimeSlotDTO mapToDTO(TimeSlot ts) {
        return new TimeSlotDTO(
                ts.getTimeSlotId(),
                ts.getDayOrder(),
                ts.getPeriodNumber(),
                ts.getStartTime(),
                ts.getEndTime(),
                ts.getStatus()
        );
    }
}
