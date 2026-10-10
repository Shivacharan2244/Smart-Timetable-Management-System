package com.example.smarttimetable.dto;

public class AuthResponse {

    private boolean success;
    private String message;
    private String token;
    private UserSummary user;

    public AuthResponse() {
    }

    public AuthResponse(boolean success, String message, String token, UserSummary user) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.user = user;
    }

    public static class UserSummary {
        private Long id;
        private String name;
        private String email;
        private String role;
        private Long facultyId;

        public UserSummary() {
        }

        public UserSummary(Long id, String name, String email, String role, Long facultyId) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.facultyId = facultyId;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public Long getFacultyId() {
            return facultyId;
        }

        public void setFacultyId(Long facultyId) {
            this.facultyId = facultyId;
        }
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserSummary getUser() {
        return user;
    }

    public void setUser(UserSummary user) {
        this.user = user;
    }
}
