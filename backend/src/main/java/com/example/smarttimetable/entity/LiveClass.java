package com.example.smarttimetable.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

@Entity
@Table(name = "live_classes")
public class LiveClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long liveClassId;

    @NotNull(message = "Timetable entry reference is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_entry_id", nullable = false)
    private TimetableEntry timetableEntry;

    @NotNull(message = "Scheduled start time is required")
    @Column(nullable = false)
    private LocalTime startTime;

    @NotNull(message = "Scheduled end time is required")
    @Column(nullable = false)
    private LocalTime endTime;

    @NotBlank(message = "Live status is required")
    @Size(max = 30)
    @Column(nullable = false, length = 30)
    private String status = "UPCOMING";

    @Column(nullable = true)
    private LocalTime actualStartTime;

    @Column(nullable = true)
    private LocalTime actualEndTime;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    public LiveClass() {
    }

    public LiveClass(TimetableEntry timetableEntry, LocalTime startTime, LocalTime endTime,
                     String status, LocalTime actualStartTime, LocalTime actualEndTime, String remarks) {
        this.timetableEntry = timetableEntry;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status != null ? status : "UPCOMING";
        this.actualStartTime = actualStartTime;
        this.actualEndTime = actualEndTime;
        this.remarks = remarks;
    }

    public Long getLiveClassId() {
        return liveClassId;
    }

    public void setLiveClassId(Long liveClassId) {
        this.liveClassId = liveClassId;
    }

    public TimetableEntry getTimetableEntry() {
        return timetableEntry;
    }

    public void setTimetableEntry(TimetableEntry timetableEntry) {
        this.timetableEntry = timetableEntry;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalTime getActualStartTime() {
        return actualStartTime;
    }

    public void setActualStartTime(LocalTime actualStartTime) {
        this.actualStartTime = actualStartTime;
    }

    public LocalTime getActualEndTime() {
        return actualEndTime;
    }

    public void setActualEndTime(LocalTime actualEndTime) {
        this.actualEndTime = actualEndTime;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
