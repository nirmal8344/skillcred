package com.adz4needz.skillcred.dto;

import java.time.LocalDate;

public class CertificateVerifyResponse {

    private boolean valid;
    private String status; // VALID, REVOKED, NOT_FOUND
    private String certificateId;
    private String studentName;
    private String courseTitle;
    private String courseDuration;
    private LocalDate completionDate;
    private LocalDate issueDate;
    private String issuingOrganization = "ADZ4NEEDZ (OPC) PVT LTD.";
    private String verificationMessage;

    public CertificateVerifyResponse() {}

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getCourseDuration() { return courseDuration; }
    public void setCourseDuration(String courseDuration) { this.courseDuration = courseDuration; }

    public LocalDate getCompletionDate() { return completionDate; }
    public void setCompletionDate(LocalDate completionDate) { this.completionDate = completionDate; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public String getIssuingOrganization() { return issuingOrganization; }
    public void setIssuingOrganization(String issuingOrganization) { this.issuingOrganization = issuingOrganization; }

    public String getVerificationMessage() { return verificationMessage; }
    public void setVerificationMessage(String verificationMessage) { this.verificationMessage = verificationMessage; }
}
