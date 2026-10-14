package com.adz4needz.skillcred.service;

import com.adz4needz.skillcred.dto.CertificateResponse;
import com.adz4needz.skillcred.dto.CertificateVerifyResponse;
import com.adz4needz.skillcred.model.*;
import com.adz4needz.skillcred.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentService assessmentService;
    private final PaymentConfigRepository paymentConfigRepository;
    private final PaymentSubmissionRepository paymentSubmissionRepository;

    public CertificateService(CertificateRepository certificateRepository,
                              CourseRepository courseRepository,
                              UserRepository userRepository,
                              EnrollmentRepository enrollmentRepository,
                              AssessmentService assessmentService,
                              PaymentConfigRepository paymentConfigRepository,
                              PaymentSubmissionRepository paymentSubmissionRepository) {
        this.certificateRepository = certificateRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assessmentService = assessmentService;
        this.paymentConfigRepository = paymentConfigRepository;
        this.paymentSubmissionRepository = paymentSubmissionRepository;
    }

    public List<CertificateResponse> getUserCertificates(Long userId) {
        List<Certificate> certs = certificateRepository.findByUserId(userId);
        List<CertificateResponse> responses = new ArrayList<>();
        for (Certificate c : certs) {
            responses.add(new CertificateResponse(c));
        }
        return responses;
    }

    public CertificateResponse getCertificateByCertId(String certificateId) {
        Certificate cert = certificateRepository.findByCertificateId(certificateId)
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found with ID: " + certificateId));
        return new CertificateResponse(cert);
    }

    @Transactional
    public CertificateResponse issueCertificate(Long userId, Long courseId, String customDisplayName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // If certificate already exists, return existing certificate (prevent duplicate issuance)
        Optional<Certificate> existingCert = certificateRepository.findByUserIdAndCourseId(userId, courseId);
        if (existingCert.isPresent()) {
            Certificate cert = existingCert.get();
            if (customDisplayName != null && !customDisplayName.isBlank()) {
                cert.setStudentName(customDisplayName.trim());
                certificateRepository.save(cert);
            }
            return new CertificateResponse(cert);
        }

        // Verify assessment requirement
        boolean passed = assessmentService.hasPassedAssessment(userId, courseId);
        if (!passed) {
            throw new IllegalStateException("You must pass the course assessment before certificate issuance.");
        }

        // Verify payment approval requirement if payments are enabled
        PaymentConfig config = paymentConfigRepository.findById(1L).orElse(null);
        if (config != null && config.isEnabled()) {
            boolean paymentApproved = paymentSubmissionRepository.existsByUserIdAndCourseIdAndStatus(
                    userId, courseId, PaymentStatus.APPROVED
            );
            if (!paymentApproved) {
                throw new IllegalStateException("Certificate issuance requires an approved payment. Please submit payment verification.");
            }
        }

        // Retrieve actual completion date from enrollment or assessment
        LocalDate completionDate = LocalDate.now();
        Optional<Enrollment> enOpt = enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        if (enOpt.isPresent() && enOpt.get().getCompletedAt() != null) {
            completionDate = enOpt.get().getCompletedAt().toLocalDate();
        }

        // Generate unique certificate ID
        String serial = String.format("%05d", (int) (Math.random() * 90000) + 10000);
        String certId = "SKILLCRED-ADZ-" + LocalDate.now().getYear() + "-" + serial;

        String studentName = (customDisplayName != null && !customDisplayName.isBlank()) ?
                customDisplayName.trim() : user.getCertificateDisplayName();
        if (studentName == null || studentName.isBlank()) {
            studentName = user.getFullName();
        }

        Certificate cert = new Certificate();
        cert.setCertificateId(certId);
        cert.setUser(user);
        cert.setCourse(course);
        cert.setStudentName(studentName);
        cert.setCourseTitle(course.getTitle());
        cert.setCourseDuration(course.getDuration() != null ? course.getDuration() : "6-Month");
        cert.setCompletionDate(completionDate);
        cert.setIssueDate(LocalDate.now());
        cert.setStatus(Certificate.Status.VALID);
        cert.setPaymentStatus(Certificate.PaymentStatus.PAID);
        cert.setPaymentAmount(99.0);
        cert.setTransactionId("TXN-" + System.currentTimeMillis());
        cert.setQrVerificationUrl("/verify/" + certId);

        Certificate saved = certificateRepository.save(cert);
        return new CertificateResponse(saved);
    }

    public CertificateVerifyResponse verifyCertificate(String certificateId) {
        CertificateVerifyResponse resp = new CertificateVerifyResponse();
        resp.setCertificateId(certificateId);

        Optional<Certificate> opt = certificateRepository.findByCertificateId(certificateId);
        if (opt.isEmpty()) {
            resp.setValid(false);
            resp.setStatus("NOT_FOUND");
            resp.setVerificationMessage("Certificate with ID " + certificateId + " does not exist in the official Adz4needz records.");
            return resp;
        }

        Certificate cert = opt.get();
        resp.setStudentName(cert.getStudentName());
        resp.setCourseTitle(cert.getCourseTitle());
        resp.setCourseDuration(cert.getCourseDuration());
        resp.setCompletionDate(cert.getCompletionDate());
        resp.setIssueDate(cert.getIssueDate());
        resp.setStatus(cert.getStatus().name());

        if (cert.getStatus() == Certificate.Status.VALID) {
            resp.setValid(true);
            resp.setVerificationMessage("Official Certificate is VALID and verified by ADZ4NEEDZ (OPC) PVT LTD.");
        } else {
            resp.setValid(false);
            resp.setVerificationMessage("This certificate has been REVOKED: " + 
                    (cert.getRevocationReason() != null ? cert.getRevocationReason() : "Administrative action"));
        }

        return resp;
    }

    @Transactional
    public CertificateResponse revokeCertificate(String certificateId, String reason) {
        Certificate cert = certificateRepository.findByCertificateId(certificateId)
                .orElseThrow(() -> new IllegalArgumentException("Certificate not found"));
        cert.setStatus(Certificate.Status.REVOKED);
        cert.setRevocationReason(reason);
        Certificate saved = certificateRepository.save(cert);
        return new CertificateResponse(saved);
    }

    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    public Certificate findByCertificateId(String certificateId) {
        return certificateRepository.findByCertificateId(certificateId).orElse(null);
    }
}
