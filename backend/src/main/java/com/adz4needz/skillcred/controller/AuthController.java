package com.adz4needz.skillcred.controller;

import com.adz4needz.skillcred.dto.AuthRequest;
import com.adz4needz.skillcred.dto.AuthResponse;
import com.adz4needz.skillcred.dto.ProfileUpdateRequest;
import com.adz4needz.skillcred.dto.RegisterRequest;
import com.adz4needz.skillcred.model.User;
import com.adz4needz.skillcred.security.SecurityHelper;
import com.adz4needz.skillcred.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SecurityHelper securityHelper;

    public AuthController(AuthService authService, SecurityHelper securityHelper) {
        this.authService = authService;
        this.securityHelper = securityHelper;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin-login")
    public ResponseEntity<AuthResponse> adminLogin(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        if (!"ADMIN".equalsIgnoreCase(response.getRole())) {
            throw new SecurityException("Access Denied: Administrator credentials required to access the Admin Portal.");
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        Long userId = securityHelper.getCurrentUserId(request);
        User user = authService.getUserById(userId);
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "certificateDisplayName", user.getCertificateDisplayName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "emailVerified", user.isEmailVerified()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            HttpServletRequest request,
            @Valid @RequestBody ProfileUpdateRequest profileRequest) {
        Long userId = securityHelper.getCurrentUserId(request);
        User user = authService.updateProfile(userId, profileRequest);
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "certificateDisplayName", user.getCertificateDisplayName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "message", "Profile updated successfully"
        ));
    }
}
