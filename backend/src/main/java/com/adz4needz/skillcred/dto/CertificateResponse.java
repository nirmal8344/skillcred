package com.adz4needz.skillcred.dto;

import com.adz4needz.skillcred.model.Certificate;
import java.time.LocalDate;

public class CertificateResponse {

    private Long id;
    private String certificateId;
    private Long courseId;
    private String studentName;
    private String courseTitle;
    private String courseDuration;
    private LocalDate completionDate;
    private LocalDate issueDate;
    private String status;
    private String paymentStatus;
    private double paymentAmount;
    private String transactionId;
    private String qrVerificationUrl;

    public CertificateResponse() {}

    public CertificateResponse(Certificate cert) {
        this.id = cert.getId();
        this.certificateId = cert.getCertificateId();
        this.courseId = cert.getCourse() != null ? cert.getCourse().getId() : null;
        this.studentName = cert.getStudentName();
        this.courseTitle = cert.getCourseTitle();
        this.courseDuration = cert.getCourseDuration();
        this.completionDate = cert.getCompletionDate();
        this.issueDate = cert.getIssueDate();
        this.status = cert.getStatus().name();
        this.paymentStatus = cert.getPaymentStatus() != null ? cert.getPaymentStatus().name() : "PAID";
        this.paymentAmount = cert.getPaymentAmount();
        this.transactionId = cert.getTransactionId();
        this.qrVerificationUrl = cert.getQrVerificationUrl();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public double getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(double paymentAmount) { this.paymentAmount = paymentAmount; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getQrVerificationUrl() { return qrVerificationUrl; }
    public void setQrVerificationUrl(String qrVerificationUrl) { this.qrVerificationUrl = qrVerificationUrl; }
}
