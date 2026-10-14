package com.adz4needz.skillcred.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final long EXPIRATION_TIME_MS = 1000L * 60 * 60 * 24 * 7; // 7 days

    @Value("${JWT_SECRET:}")
    private String jwtSecret;

    @Value("${SKILLCRED_ENV:development}")
    private String environment;

    /**
     * Fail-fast on startup: refuse to start in production without a real JWT secret.
     */
    @PostConstruct
    public void validateSecret() {
        boolean isProduction = "production".equalsIgnoreCase(environment);
        if (isProduction && (jwtSecret == null || jwtSecret.isBlank())) {
            throw new IllegalStateException(
                "FATAL: JWT_SECRET environment variable is required in production. " +
                "The application will NOT start without it. " +
                "Set JWT_SECRET to a strong, unique 64+ character secret."
            );
        }
        if (!isProduction && (jwtSecret == null || jwtSecret.isBlank())) {
            System.out.println(">>> [DEV MODE] JWT_SECRET not set. Using development-only fallback secret.");
        }
    }

    private Key getSigningKey() {
        // In development, if JWT_SECRET is not set, use a dev-only secret.
        // In production, validateSecret() already ensured this is set.
        String secret = (jwtSecret != null && !jwtSecret.isBlank())
                ? jwtSecret
                : "adz4needz_skillcred_dev_only_secret_key_2026_never_use_in_prod";

        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String email, String role, String fullName) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("fullName", fullName);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME_MS))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        Number id = (Number) claims.get("userId");
        return id != null ? id.longValue() : null;
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return (String) claims.get("role");
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token, String email) {
        try {
            final String tokenEmail = extractEmail(token);
            return (tokenEmail.equals(email) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}
