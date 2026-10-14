package com.adz4needz.skillcred;

import com.adz4needz.skillcred.security.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtUtilSecurityTest {

    @Test
    @DisplayName("In production mode, JwtUtil must throw IllegalStateException if JWT_SECRET is empty")
    void testProductionFailsWithoutJwtSecret() {
        JwtUtil jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "environment", "production");
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", "");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            jwtUtil.validateSecret();
        });

        assertTrue(ex.getMessage().contains("JWT_SECRET environment variable is required in production"));
    }

    @Test
    @DisplayName("In production mode, JwtUtil must pass if JWT_SECRET is provided")
    void testProductionPassesWithJwtSecret() {
        JwtUtil jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "environment", "production");
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", "a_very_long_secure_production_secret_key_that_exceeds_64_bytes_for_hmac_sha256");

        assertDoesNotThrow(() -> {
            jwtUtil.validateSecret();
        });
    }

    @Test
    @DisplayName("In development mode, JwtUtil allows blank JWT_SECRET with fallback")
    void testDevAllowsBlankJwtSecret() {
        JwtUtil jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "environment", "development");
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", "");

        assertDoesNotThrow(() -> {
            jwtUtil.validateSecret();
        });
    }
}
