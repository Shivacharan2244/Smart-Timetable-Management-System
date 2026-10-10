package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findBySubjectCode(String subjectCode);

    boolean existsBySubjectCode(String subjectCode);

    List<Subject> findByDepartment_DepartmentId(Long departmentId);

    List<Subject> findBySemester_SemesterId(Long semesterId);

    List<Subject> findByDepartment_DepartmentIdAndSemester_SemesterId(Long departmentId, Long semesterId);

    List<Subject> findByStatus(String status);
}
