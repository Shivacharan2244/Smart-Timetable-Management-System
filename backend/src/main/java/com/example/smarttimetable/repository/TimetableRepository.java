package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    List<Timetable> findByDepartment_DepartmentId(Long departmentId);

    List<Timetable> findByAcademicYear_AcademicYearId(Long academicYearId);

    List<Timetable> findBySemester_SemesterId(Long semesterId);

    List<Timetable> findBySection_SectionId(Long sectionId);

    List<Timetable> findByActiveTrue();

    Optional<Timetable> findBySection_SectionIdAndActiveTrue(Long sectionId);

    List<Timetable> findByDepartment_DepartmentIdAndAcademicYear_AcademicYearIdAndSemester_SemesterIdAndSection_SectionId(
            Long departmentId, Long academicYearId, Long semesterId, Long sectionId);

    List<Timetable> findByStatus(String status);
}
