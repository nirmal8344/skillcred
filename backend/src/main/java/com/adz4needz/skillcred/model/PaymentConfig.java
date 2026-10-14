package com.adz4needz.skillcred.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_configs")
public class PaymentConfig {

    @Id
    private Long id = 1L;

    @Column(nullable = false)
    private String upiId = "adz4needz@okaxis";

    private String paymentNumber = "+91 9876543210";

    @Column(nullable = false)
    private String recipientName = "ADZ4NEEDZ (OPC) PRIVATE LIMITED";

    @Column(nullable = false)
    private double certificateFee = 99.0;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(columnDefinition = "TEXT")
    private String qrImageUrl;

    @Column(columnDefinition = "TEXT")
    private String instructions = "Scan the QR code using Google Pay, PhonePe, Paytm, or BHIM. Pay the certificate verification fee of ₹99. Once done, enter the 12-digit UTR / UPI Reference Number below and upload the transaction screenshot for verification.";

    private LocalDateTime updatedAt = LocalDateTime.now();

    public PaymentConfig() {}

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

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
