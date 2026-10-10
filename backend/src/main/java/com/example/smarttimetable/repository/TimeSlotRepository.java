package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByDayOrderOrderByPeriodNumberAsc(String dayOrder);

    List<TimeSlot> findByPeriodNumber(Integer periodNumber);

    Optional<TimeSlot> findByDayOrderAndPeriodNumber(String dayOrder, Integer periodNumber);

    boolean existsByDayOrderAndPeriodNumber(String dayOrder, Integer periodNumber);

    List<TimeSlot> findByStatus(String status);

    List<TimeSlot> findAllByOrderByPeriodNumberAsc();
    List<TimeSlot> findAllByOrderByDayOrderAscPeriodNumberAsc();
}
