package com.adz4needz.skillcred.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class SecurityHelper {

    private final JwtUtil jwtUtil;

    public SecurityHelper(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public Long getCurrentUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization token is missing or invalid");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }

    public String getCurrentUserRole(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        return jwtUtil.extractRole(token);
    }

    public void requireAdmin(HttpServletRequest request) {
        String role = getCurrentUserRole(request);
        if (!"ADMIN".equals(role)) {
            throw new SecurityException("Administrative privileges required");
        }
    }
}
