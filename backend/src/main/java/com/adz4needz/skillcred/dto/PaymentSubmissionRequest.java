package com.adz4needz.skillcred.dto;

public class PaymentSubmissionRequest {
    private Long courseId;
    private String utrNumber;
    private String proofImageUrl;

    public PaymentSubmissionRequest() {}

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getUtrNumber() { return utrNumber; }
    public void setUtrNumber(String utrNumber) { this.utrNumber = utrNumber; }

    public String getProofImageUrl() { return proofImageUrl; }
    public void setProofImageUrl(String proofImageUrl) { this.proofImageUrl = proofImageUrl; }
}
