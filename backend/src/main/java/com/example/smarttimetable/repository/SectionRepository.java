package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    List<Section> findByDepartment_DepartmentId(Long departmentId);

    List<Section> findBySemester_SemesterId(Long semesterId);

    List<Section> findByDepartment_DepartmentIdAndSemester_SemesterId(Long departmentId, Long semesterId);

    Optional<Section> findBySectionNameAndDepartment_DepartmentIdAndSemester_SemesterId(
            String sectionName, Long departmentId, Long semesterId);

    boolean existsBySectionNameAndDepartment_DepartmentIdAndSemester_SemesterId(
            String sectionName, Long departmentId, Long semesterId);

    List<Section> findByStatus(String status);
}
