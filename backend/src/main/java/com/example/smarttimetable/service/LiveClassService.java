package com.example.smarttimetable.service;

import com.example.smarttimetable.dto.LiveClassDTO;

import java.util.List;

public interface LiveClassService {
    LiveClassDTO createLiveClass(LiveClassDTO dto);
    LiveClassDTO getLiveClassById(Long id);
    List<LiveClassDTO> getAllLiveClasses();
    List<LiveClassDTO> getTodayLiveClasses();
    List<LiveClassDTO> getRunningLiveClasses();
    List<LiveClassDTO> getUpcomingLiveClasses();
    LiveClassDTO startClass(Long id);
    LiveClassDTO endClass(Long id);
    LiveClassDTO cancelClass(Long id, String reason);
    LiveClassDTO changeRoom(Long id, Long newRoomId, String reason);
    List<LiveClassDTO> syncTodayClasses();
}
