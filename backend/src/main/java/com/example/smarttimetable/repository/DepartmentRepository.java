package com.example.smarttimetable.repository;

import com.example.smarttimetable.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByDepartmentCode(String departmentCode);

    boolean existsByDepartmentCode(String departmentCode);

    Optional<Department> findByDepartmentName(String departmentName);

    List<Department> findByStatus(String status);
}
