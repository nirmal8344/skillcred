package com.adz4needz.skillcred.controller;

import com.adz4needz.skillcred.dto.*;
import com.adz4needz.skillcred.security.SecurityHelper;
import com.adz4needz.skillcred.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final SecurityHelper securityHelper;

    public PaymentController(PaymentService paymentService, SecurityHelper securityHelper) {
        this.paymentService = paymentService;
        this.securityHelper = securityHelper;
    }

    // Public: get payment config (QR code, UPI ID, fee)
    @GetMapping("/config")
    public ResponseEntity<PaymentConfigDto> getPaymentConfig() {
        PaymentConfigDto config = paymentService.getPaymentConfig();
        return ResponseEntity.ok(config);
    }

    // Student: submit payment
    @PostMapping("/submit")
    public ResponseEntity<PaymentSubmissionResponse> submitPayment(
            @RequestBody PaymentSubmissionRequest req,
            HttpServletRequest request) {
        Long userId = securityHelper.getCurrentUserId(request);
        PaymentSubmissionResponse resp = paymentService.submitPayment(userId, req);
        return ResponseEntity.ok(resp);
    }

    // Student: get payment status for a specific course
    @GetMapping("/status/{courseId}")
    public ResponseEntity<?> getPaymentStatus(
            @PathVariable Long courseId,
            HttpServletRequest request) {
        Long userId = securityHelper.getCurrentUserId(request);
        PaymentSubmissionResponse resp = paymentService.getPaymentStatus(userId, courseId);
        if (resp == null) {
            return ResponseEntity.ok(Collections.singletonMap("status", "NO_PAYMENT"));
        }
        return ResponseEntity.ok(resp);
    }

    // Student: get all my payments
    @GetMapping("/my-payments")
    public ResponseEntity<List<PaymentSubmissionResponse>> getMyPayments(HttpServletRequest request) {
        Long userId = securityHelper.getCurrentUserId(request);
        List<PaymentSubmissionResponse> list = paymentService.getMyPayments(userId);
        return ResponseEntity.ok(list);
    }

    // Student: check if payment is approved for a course
    @GetMapping("/approved/{courseId}")
    public ResponseEntity<Map<String, Object>> isPaymentApproved(
            @PathVariable Long courseId,
            HttpServletRequest request) {
        Long userId = securityHelper.getCurrentUserId(request);
        boolean approved = paymentService.hasApprovedPayment(userId, courseId);
        Map<String, Object> result = new HashMap<>();
        result.put("approved", approved);
        return ResponseEntity.ok(result);
    }
}
