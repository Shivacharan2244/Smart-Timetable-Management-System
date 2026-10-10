package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByFacultyCode(String facultyCode);

    Optional<Faculty> findByEmail(String email);

    boolean existsByFacultyCode(String facultyCode);

    boolean existsByEmail(String email);

    List<Faculty> findByDepartment_DepartmentId(Long departmentId);

    List<Faculty> findByStatus(String status);

    List<Faculty> findByDepartment_DepartmentIdAndStatus(Long departmentId, String status);
}
