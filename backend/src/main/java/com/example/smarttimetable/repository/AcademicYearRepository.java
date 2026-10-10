package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {

    Optional<AcademicYear> findByAcademicYear(String academicYear);

    boolean existsByAcademicYear(String academicYear);

    List<AcademicYear> findByActiveTrue();

    Optional<AcademicYear> findFirstByActiveTrue();

    List<AcademicYear> findByStatus(String status);
}
