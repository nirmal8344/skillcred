package com.adz4needz.skillcred.dto;

import com.adz4needz.skillcred.model.PaymentConfig;

public class PaymentConfigDto {
    private Long id;
    private String upiId;
    private String paymentNumber;
    private String recipientName;
    private double certificateFee;
    private boolean enabled;
    private String qrImageUrl;
    private String instructions;
    private boolean configured;

    public PaymentConfigDto() {}

    public PaymentConfigDto(PaymentConfig config) {
        if (config != null) {
            this.id = config.getId();
            this.upiId = config.getUpiId();
            this.paymentNumber = config.getPaymentNumber();
            this.recipientName = config.getRecipientName();
            this.certificateFee = config.getCertificateFee();
            this.enabled = config.isEnabled();
            this.qrImageUrl = config.getQrImageUrl();
            this.instructions = config.getInstructions();
            this.configured = (config.getUpiId() != null && !config.getUpiId().isBlank())
                    || (config.getQrImageUrl() != null && !config.getQrImageUrl().isBlank());
        } else {
            this.configured = false;
            this.enabled = false;
            this.certificateFee = 99.0;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }

    public String getPaymentNumber() { return paymentNumber; }
    public void setPaymentNumber(String paymentNumber) { this.paymentNumber = paymentNumber; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public double getCertificateFee() { return certificateFee; }
    public void setCertificateFee(double certificateFee) { this.certificateFee = certificateFee; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getQrImageUrl() { return qrImageUrl; }
    public void setQrImageUrl(String qrImageUrl) { this.qrImageUrl = qrImageUrl; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public boolean isConfigured() { return configured; }
    public void setConfigured(boolean configured) { this.configured = configured; }
}
