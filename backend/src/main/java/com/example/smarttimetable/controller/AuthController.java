package com.example.smarttimetable.controller;

import com.example.smarttimetable.dto.ApiResponse;
import com.example.smarttimetable.dto.AuthResponse;
import com.example.smarttimetable.dto.LoginRequest;
import com.example.smarttimetable.entity.Faculty;
import com.example.smarttimetable.entity.User;
import com.example.smarttimetable.repository.FacultyRepository;
import com.example.smarttimetable.repository.UserRepository;
import com.example.smarttimetable.security.CustomUserDetails;
import com.example.smarttimetable.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtils jwtUtils,
                          UserRepository userRepository,
                          FacultyRepository facultyRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.facultyRepository = facultyRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // Optional linked Faculty ID lookup for FACULTY role
        Long facultyId = null;
        if ("FACULTY".equalsIgnoreCase(userDetails.getRole().name())) {
            Optional<Faculty> facOpt = facultyRepository.findByEmail(email);
            if (facOpt.isPresent()) {
                facultyId = facOpt.get().getFacultyId();
            }
        }

        AuthResponse.UserSummary userSummary = new AuthResponse.UserSummary(
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getUsername(),
                userDetails.getRole().name(),
                facultyId
        );

        return ResponseEntity.ok(new AuthResponse(true, "Login successful", jwt, userSummary));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserSummary>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated."));
        }

        Long facultyId = null;
        if ("FACULTY".equalsIgnoreCase(userDetails.getRole().name())) {
            Optional<Faculty> facOpt = facultyRepository.findByEmail(userDetails.getUsername());
            if (facOpt.isPresent()) {
                facultyId = facOpt.get().getFacultyId();
            }
        }

        AuthResponse.UserSummary summary = new AuthResponse.UserSummary(
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getUsername(),
                userDetails.getRole().name(),
                facultyId
        );

        return ResponseEntity.ok(ApiResponse.success("Current user profile retrieved.", summary));
    }
}
