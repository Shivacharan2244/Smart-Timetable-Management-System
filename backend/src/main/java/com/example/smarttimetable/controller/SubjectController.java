package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.SubjectDTO;
import com.example.smarttimetable.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubjectDTO>>> getAllSubjects() {
        List<SubjectDTO> list = subjectService.getAllSubjects();
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved successfully.", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectDTO>> getSubjectById(@PathVariable Long id) {
        SubjectDTO dto = subjectService.getSubjectById(id);
        return ResponseEntity.ok(ApiResponse.success("Subject retrieved successfully.", dto));
    }

    @GetMapping("/code/{subjectCode}")
    public ResponseEntity<ApiResponse<SubjectDTO>> getSubjectByCode(@PathVariable String subjectCode) {
        SubjectDTO dto = subjectService.getSubjectByCode(subjectCode);
        return ResponseEntity.ok(ApiResponse.success("Subject retrieved successfully.", dto));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<ApiResponse<List<SubjectDTO>>> getSubjectsByDepartment(@PathVariable Long departmentId) {
        List<SubjectDTO> list = subjectService.getSubjectsByDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success("Subjects for department retrieved successfully.", list));
    }

    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<ApiResponse<List<SubjectDTO>>> getSubjectsBySemester(@PathVariable Long semesterId) {
        List<SubjectDTO> list = subjectService.getSubjectsBySemester(semesterId);
        return ResponseEntity.ok(ApiResponse.success("Subjects for semester retrieved successfully.", list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubjectDTO>> createSubject(@Valid @RequestBody SubjectDTO dto) {
        SubjectDTO created = subjectService.createSubject(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subject created successfully.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubjectDTO>> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody SubjectDTO dto) {
        SubjectDTO updated = subjectService.updateSubject(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Subject updated successfully.", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully."));
    }
}
