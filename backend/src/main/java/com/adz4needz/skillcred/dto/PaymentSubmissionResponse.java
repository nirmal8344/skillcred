package com.adz4needz.skillcred.dto;

import com.adz4needz.skillcred.model.PaymentSubmission;
import java.time.LocalDateTime;

public class PaymentSubmissionResponse {
    private Long id;
    private Long userId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseTitle;
    private String utrNumber;
    private double amount;
    private String proofImageUrl;
    private String status;
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
    private String certificateId;

    public PaymentSubmissionResponse() {}

    public PaymentSubmissionResponse(PaymentSubmission sub) {
        if (sub != null) {
            this.id = sub.getId();
            if (sub.getUser() != null) {
                this.userId = sub.getUser().getId();
                this.studentName = sub.getUser().getFullName();
                this.studentEmail = sub.getUser().getEmail();
            }
            if (sub.getCourse() != null) {
                this.courseId = sub.getCourse().getId();
                this.courseTitle = sub.getCourse().getTitle();
            }
            this.utrNumber = sub.getUtrNumber();
            this.amount = sub.getAmount();
            this.proofImageUrl = sub.getProofImageUrl();
            this.status = sub.getStatus() != null ? sub.getStatus().name() : null;
            this.rejectionReason = sub.getRejectionReason();
            if (sub.getReviewedBy() != null) {
                this.reviewedBy = sub.getReviewedBy().getFullName();
            }
            this.submittedAt = sub.getSubmittedAt();
            this.reviewedAt = sub.getReviewedAt();
            if (sub.getCertificate() != null) {
                this.certificateId = sub.getCertificate().getCertificateId();
            }
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getUtrNumber() { return utrNumber; }
    public void setUtrNumber(String utrNumber) { this.utrNumber = utrNumber; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getProofImageUrl() { return proofImageUrl; }
    public void setProofImageUrl(String proofImageUrl) { this.proofImageUrl = proofImageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }
}
