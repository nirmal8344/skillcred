package com.adz4needz.skillcred.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String certificateDisplayName;

    @Column(nullable = false, unique = true)
    private String email;

    private String mobileNumber;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.STUDENT;

    private boolean emailVerified = true;

    // Learner categorization & education/career fields
    private String learnerCategory; // "College Student", "Graduate", "Working Professional", "Other Learner"
    private String collegeName;
    private String degreeCourse;
    private String department;
    private String currentYearOfStudy;
    private String graduationYear;
    private String jobRole;
    private String companyName;
    private String industry;
    private String qualification;
    private String learningGoal;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Role {
        STUDENT,
        ADMIN
    }

    public User() {}

    public User(String fullName, String email, String password, Role role) {
        this.fullName = fullName;
        this.certificateDisplayName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.emailVerified = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { 
        this.fullName = fullName;
        if (this.certificateDisplayName == null || this.certificateDisplayName.isBlank()) {
            this.certificateDisplayName = fullName;
        }
    }

    public String getCertificateDisplayName() { return certificateDisplayName; }
    public void setCertificateDisplayName(String certificateDisplayName) { this.certificateDisplayName = certificateDisplayName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getLearnerCategory() { return learnerCategory; }
    public void setLearnerCategory(String learnerCategory) { this.learnerCategory = learnerCategory; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getDegreeCourse() { return degreeCourse; }
    public void setDegreeCourse(String degreeCourse) { this.degreeCourse = degreeCourse; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getCurrentYearOfStudy() { return currentYearOfStudy; }
    public void setCurrentYearOfStudy(String currentYearOfStudy) { this.currentYearOfStudy = currentYearOfStudy; }

    public String getGraduationYear() { return graduationYear; }
    public void setGraduationYear(String graduationYear) { this.graduationYear = graduationYear; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getLearningGoal() { return learningGoal; }
    public void setLearningGoal(String learningGoal) { this.learningGoal = learningGoal; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
