package com.adz4needz.skillcred.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String confirmPassword;

    private String mobileNumber;

    private String certificateDisplayName;

    // Category and dynamic fields
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

    public RegisterRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getCertificateDisplayName() { return certificateDisplayName; }
    public void setCertificateDisplayName(String certificateDisplayName) { this.certificateDisplayName = certificateDisplayName; }

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
}
