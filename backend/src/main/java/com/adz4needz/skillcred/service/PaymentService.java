package com.adz4needz.skillcred.service;

import com.adz4needz.skillcred.dto.*;
import com.adz4needz.skillcred.model.*;
import com.adz4needz.skillcred.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PaymentService {

    private final PaymentConfigRepository paymentConfigRepository;
    private final PaymentSubmissionRepository paymentSubmissionRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AssessmentService assessmentService;
    private final CertificateService certificateService;

    public PaymentService(PaymentConfigRepository paymentConfigRepository,
                          PaymentSubmissionRepository paymentSubmissionRepository,
                          UserRepository userRepository,
                          CourseRepository courseRepository,
                          AssessmentService assessmentService,
                          CertificateService certificateService) {
        this.paymentConfigRepository = paymentConfigRepository;
        this.paymentSubmissionRepository = paymentSubmissionRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.assessmentService = assessmentService;
        this.certificateService = certificateService;
    }

    // ─── Payment Config ─────────────────────────────────
    public PaymentConfigDto getPaymentConfig() {
        PaymentConfig config = paymentConfigRepository.findById(1L).orElseGet(() -> {
            PaymentConfig def = new PaymentConfig();
            return paymentConfigRepository.save(def);
        });
        return new PaymentConfigDto(config);
    }

    @Transactional
    public PaymentConfigDto updatePaymentConfig(PaymentConfigDto dto) {
        PaymentConfig config = paymentConfigRepository.findById(1L).orElse(new PaymentConfig());
        config.setId(1L);
        if (dto.getUpiId() != null) config.setUpiId(dto.getUpiId());
        if (dto.getPaymentNumber() != null) config.setPaymentNumber(dto.getPaymentNumber());
        if (dto.getRecipientName() != null) config.setRecipientName(dto.getRecipientName());
        if (dto.getCertificateFee() > 0) config.setCertificateFee(dto.getCertificateFee());
        config.setEnabled(dto.isEnabled());
        if (dto.getQrImageUrl() != null) {
            validateQrImage(dto.getQrImageUrl());
            config.setQrImageUrl(dto.getQrImageUrl());
        }
        if (dto.getInstructions() != null) config.setInstructions(dto.getInstructions());
        config.setUpdatedAt(LocalDateTime.now());
        paymentConfigRepository.save(config);
        return new PaymentConfigDto(config);
    }

    @Transactional
    public PaymentConfigDto updateQrImage(String qrImageUrl) {
        validateQrImage(qrImageUrl);
        PaymentConfig config = paymentConfigRepository.findById(1L).orElse(new PaymentConfig());
        config.setId(1L);
        config.setQrImageUrl(qrImageUrl);
        config.setUpdatedAt(LocalDateTime.now());
        paymentConfigRepository.save(config);
        return new PaymentConfigDto(config);
    }

    private void validateQrImage(String qrImageUrl) {
        if (qrImageUrl == null || qrImageUrl.isBlank()) {
            return; // Can be cleared/reverted to auto-generated dynamic QR
        }
        if (qrImageUrl.startsWith("data:")) {
            if (!qrImageUrl.matches("^data:image\\/(png|jpeg|jpg|webp|svg\\+xml);base64,[A-Za-z0-9+/=]+$")) {
                throw new IllegalArgumentException("Invalid QR code image format. Allowed formats: PNG, JPG, JPEG, WEBP, or SVG.");
            }
            if (qrImageUrl.length() > 7_000_000) {
                throw new IllegalArgumentException("QR code image size exceeds the maximum permitted limit of 5MB.");
            }
        } else if (!qrImageUrl.startsWith("http://") && !qrImageUrl.startsWith("https://") && !qrImageUrl.startsWith("/")) {
            throw new IllegalArgumentException("Invalid QR code image source.");
        }
    }

    // ─── Student Payment Submission ─────────────────────
    @Transactional
    public PaymentSubmissionResponse submitPayment(Long userId, PaymentSubmissionRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Verify student passed the assessment
        boolean passed = assessmentService.hasPassedAssessment(userId, req.getCourseId());
        if (!passed) {
            throw new IllegalStateException("You must pass the assessment before submitting payment.");
        }

        // Verify payment is enabled
        PaymentConfig config = paymentConfigRepository.findById(1L).orElse(null);
        if (config == null || !config.isEnabled()) {
            throw new IllegalStateException("Certificate payments are currently disabled.");
        }

        // Check for already-approved payment
        if (paymentSubmissionRepository.existsByUserIdAndCourseIdAndStatus(userId, req.getCourseId(), PaymentStatus.APPROVED)) {
            throw new IllegalStateException("Payment has already been approved for this course. You can download your certificate.");
        }

        // Validate UTR
        if (req.getUtrNumber() == null || req.getUtrNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("UTR / Transaction Reference Number is required.");
        }

        PaymentSubmission sub = new PaymentSubmission(
                user, course,
                req.getUtrNumber().trim(),
                config.getCertificateFee(),
                req.getProofImageUrl()
        );
        PaymentSubmission saved = paymentSubmissionRepository.save(sub);
        return new PaymentSubmissionResponse(saved);
    }

    // Get student's payment status for a specific course
    public PaymentSubmissionResponse getPaymentStatus(Long userId, Long courseId) {
        Optional<PaymentSubmission> latest = paymentSubmissionRepository
                .findTopByUserIdAndCourseIdOrderBySubmittedAtDesc(userId, courseId);
        return latest.map(PaymentSubmissionResponse::new).orElse(null);
    }

    // Get all student's payments
    public List<PaymentSubmissionResponse> getMyPayments(Long userId) {
        List<PaymentSubmission> subs = paymentSubmissionRepository.findByUserId(userId);
        List<PaymentSubmissionResponse> result = new ArrayList<>();
        for (PaymentSubmission s : subs) {
            result.add(new PaymentSubmissionResponse(s));
        }
        return result;
    }

    // ─── Admin Payment Verification ─────────────────────
    public List<PaymentSubmissionResponse> getAllPayments() {
        List<PaymentSubmission> all = paymentSubmissionRepository.findAllByOrderBySubmittedAtDesc();
        List<PaymentSubmissionResponse> result = new ArrayList<>();
        for (PaymentSubmission s : all) {
            result.add(new PaymentSubmissionResponse(s));
        }
        return result;
    }

    public List<PaymentSubmissionResponse> getPendingPayments() {
        List<PaymentSubmission> pending = paymentSubmissionRepository
                .findByStatusOrderBySubmittedAtDesc(PaymentStatus.PENDING_VERIFICATION);
        List<PaymentSubmissionResponse> result = new ArrayList<>();
        for (PaymentSubmission s : pending) {
            result.add(new PaymentSubmissionResponse(s));
        }
        return result;
    }

    @Transactional
    public PaymentSubmissionResponse approvePayment(Long paymentId, Long adminUserId) {
        PaymentSubmission sub = paymentSubmissionRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment submission not found"));

        if (sub.getStatus() == PaymentStatus.APPROVED) {
            throw new IllegalStateException("Payment is already approved.");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));

        sub.setStatus(PaymentStatus.APPROVED);
        sub.setReviewedBy(admin);
        sub.setReviewedAt(LocalDateTime.now());
        sub.setRejectionReason(null);
        paymentSubmissionRepository.saveAndFlush(sub);

        // Issue certificate upon approval
        try {
            CertificateResponse certResp = certificateService.issueCertificate(
                    sub.getUser().getId(),
                    sub.getCourse().getId(),
                    sub.getUser().getCertificateDisplayName()
            );
            // Link certificate to payment
            Certificate cert = certificateService.findByCertificateId(certResp.getCertificateId());
            if (cert != null) {
                sub.setCertificate(cert);
            }
        } catch (Exception e) {
            // Certificate issuance failed but payment still approved
            System.err.println("Certificate issuance after payment approval failed: " + e.getMessage());
        }

        paymentSubmissionRepository.save(sub);
        return new PaymentSubmissionResponse(sub);
    }

    @Transactional
    public PaymentSubmissionResponse rejectPayment(Long paymentId, Long adminUserId, String reason) {
        PaymentSubmission sub = paymentSubmissionRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment submission not found"));

        if (sub.getStatus() == PaymentStatus.APPROVED) {
            throw new IllegalStateException("Cannot reject an already approved payment.");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));

        sub.setStatus(PaymentStatus.REJECTED);
        sub.setReviewedBy(admin);
        sub.setReviewedAt(LocalDateTime.now());
        sub.setRejectionReason(reason != null && !reason.isBlank() ? reason.trim() : "Payment verification failed");

        paymentSubmissionRepository.save(sub);
        return new PaymentSubmissionResponse(sub);
    }

    // Payment stats for admin dashboard
    public Map<String, Object> getPaymentStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingPayments", paymentSubmissionRepository.countByStatus(PaymentStatus.PENDING_VERIFICATION));
        stats.put("approvedPayments", paymentSubmissionRepository.countByStatus(PaymentStatus.APPROVED));
        stats.put("rejectedPayments", paymentSubmissionRepository.countByStatus(PaymentStatus.REJECTED));
        stats.put("totalPayments", paymentSubmissionRepository.count());
        return stats;
    }

    // Check if student has approved payment for a course
    public boolean hasApprovedPayment(Long userId, Long courseId) {
        return paymentSubmissionRepository.existsByUserIdAndCourseIdAndStatus(
                userId, courseId, PaymentStatus.APPROVED);
    }
}
