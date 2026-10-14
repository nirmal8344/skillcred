package com.adz4needz.skillcred.controller;

import com.adz4needz.skillcred.dto.CertificateResponse;
import com.adz4needz.skillcred.dto.CertificateVerifyResponse;
import com.adz4needz.skillcred.security.SecurityHelper;
import com.adz4needz.skillcred.service.CertificateService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;
    private final SecurityHelper securityHelper;

    public CertificateController(CertificateService certificateService, SecurityHelper securityHelper) {
        this.certificateService = certificateService;
        this.securityHelper = securityHelper;
    }

    @PostMapping("/issue")
    public ResponseEntity<CertificateResponse> issueCertificate(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        Long userId = securityHelper.getCurrentUserId(request);
        Number courseIdNum = (Number) payload.get("courseId");
        if (courseIdNum == null) {
            throw new IllegalArgumentException("Course ID is required");
        }
        String customDisplayName = (String) payload.get("certificateDisplayName");

        CertificateResponse response = certificateService.issueCertificate(
                userId, courseIdNum.longValue(), customDisplayName
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-certificates")
    public ResponseEntity<List<CertificateResponse>> getMyCertificates(HttpServletRequest request) {
        Long userId = securityHelper.getCurrentUserId(request);
        return ResponseEntity.ok(certificateService.getUserCertificates(userId));
    }

    @GetMapping("/{certificateId}")
    public ResponseEntity<CertificateResponse> getCertificate(@PathVariable String certificateId) {
        return ResponseEntity.ok(certificateService.getCertificateByCertId(certificateId));
    }

    // Public QR verification endpoint - no login required!
    @GetMapping("/verify/{certificateId}")
    public ResponseEntity<CertificateVerifyResponse> verifyCertificate(@PathVariable String certificateId) {
        return ResponseEntity.ok(certificateService.verifyCertificate(certificateId));
    }
}
