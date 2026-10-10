package com.example.smarttimetable.config;

import com.example.smarttimetable.entity.Department;
import com.example.smarttimetable.entity.Faculty;
import com.example.smarttimetable.entity.Role;
import com.example.smarttimetable.entity.User;
import com.example.smarttimetable.repository.DepartmentRepository;
import com.example.smarttimetable.repository.FacultyRepository;
import com.example.smarttimetable.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           FacultyRepository facultyRepository,
                           DepartmentRepository departmentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.facultyRepository = facultyRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        initializeAdminUser();
        initializeFacultyUser();
    }

    private void initializeAdminUser() {
        String adminEmail = "admin@gmail.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setName("System Administrator");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setStatus("ACTIVE");
            userRepository.save(admin);
            log.info("✓ Created default Admin user: {}", adminEmail);
        } else {
            log.info("✓ Admin user already exists: {}", adminEmail);
        }
    }

    private void initializeFacultyUser() {
        String facultyEmail = "faculty@gmail.com";
        if (!userRepository.existsByEmail(facultyEmail)) {
            User facultyUser = new User();
            facultyUser.setName("Prof. Sarah Connor");
            facultyUser.setEmail(facultyEmail);
            facultyUser.setPassword(passwordEncoder.encode("faculty123"));
            facultyUser.setRole(Role.FACULTY);
            facultyUser.setStatus("ACTIVE");
            userRepository.save(facultyUser);
            log.info("✓ Created default Faculty user: {}", facultyEmail);
        } else {
            log.info("✓ Faculty user already exists: {}", facultyEmail);
        }

        // Ensure department is Artificial Intelligence and Machine Learning
        Department dept = departmentRepository.findAll().stream().findFirst().orElseGet(() -> {
            Department newDept = new Department();
            newDept.setDepartmentName("Artificial Intelligence and Machine Learning");
            newDept.setDepartmentCode("AIML");
            newDept.setStatus("ACTIVE");
            return departmentRepository.save(newDept);
        });

        if (dept.getDepartmentName() == null || dept.getDepartmentName().contains("Computer Science")) {
            dept.setDepartmentName("Artificial Intelligence and Machine Learning");
            dept.setDepartmentCode("AIML");
            departmentRepository.save(dept);
        }

        // Also ensure linked Faculty record exists in faculties table for dashboard operations
        if (!facultyRepository.existsByEmail(facultyEmail)) {
            Faculty faculty = new Faculty();
            faculty.setFacultyName("Prof. Sarah Connor");
            faculty.setFacultyCode("FAC-SC-01");
            faculty.setEmail(facultyEmail);
            faculty.setDepartment(dept);
            faculty.setStatus("ACTIVE");
            facultyRepository.save(faculty);
            log.info("✓ Created default Faculty profile in faculties table: {}", facultyEmail);
        }
    }
}
