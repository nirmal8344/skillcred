package com.adz4needz.skillcred.dto;

import com.adz4needz.skillcred.model.User;

public class AuthResponse {

    private String token;
    private Long id;
    private String fullName;
    private String certificateDisplayName;
    private String email;
    private String role;
    private String learnerCategory;

    public AuthResponse() {}

    public AuthResponse(String token, User user) {
        this.token = token;
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.certificateDisplayName = user.getCertificateDisplayName();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.learnerCategory = user.getLearnerCategory();
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCertificateDisplayName() { return certificateDisplayName; }
    public void setCertificateDisplayName(String certificateDisplayName) { this.certificateDisplayName = certificateDisplayName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getLearnerCategory() { return learnerCategory; }
    public void setLearnerCategory(String learnerCategory) { this.learnerCategory = learnerCategory; }
}
