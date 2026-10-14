package com.adz4needz.skillcred.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {

    @NotBlank(message = "Full name cannot be empty")
    @Size(min = 2, max = 100)
    private String fullName;

    @NotBlank(message = "Certificate display name cannot be empty")
    @Size(min = 2, max = 100)
    private String certificateDisplayName;

    public ProfileUpdateRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCertificateDisplayName() { return certificateDisplayName; }
    public void setCertificateDisplayName(String certificateDisplayName) { this.certificateDisplayName = certificateDisplayName; }
}
