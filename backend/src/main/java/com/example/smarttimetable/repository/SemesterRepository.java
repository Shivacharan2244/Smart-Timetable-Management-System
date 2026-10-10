package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {

    List<Semester> findByAcademicYear_AcademicYearId(Long academicYearId);

    List<Semester> findBySemesterNumber(Integer semesterNumber);

    Optional<Semester> findBySemesterNumberAndAcademicYear_AcademicYearId(Integer semesterNumber, Long academicYearId);

    List<Semester> findByStatus(String status);
}
