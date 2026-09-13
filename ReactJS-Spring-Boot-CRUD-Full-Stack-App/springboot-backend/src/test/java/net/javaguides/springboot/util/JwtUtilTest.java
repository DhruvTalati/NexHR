package net.javaguides.springboot.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import net.javaguides.springboot.security.JwtUtil;

class JwtUtilTest {

    // Same shape/length as the dev default in application.properties - a
    // real, valid base64 HS256 key, just a different one, isolated to tests.
    private static final String TEST_SECRET =
            "dGVzdC1zZWNyZXQta2V5LWZvci1qd3QtdW5pdC10ZXN0cy1vbmx5LW5vdC1mb3ItcHJvZHVjdGlvbi11c2U=";

    @Test
    void generateToken_thenExtractEmailAndRole_roundTrips() {
        JwtUtil jwtUtil = new JwtUtil(TEST_SECRET, 60_000L);

        String token = jwtUtil.generateToken("ada@example.com", "ADMIN");

        assertThat(jwtUtil.extractEmail(token)).isEqualTo("ada@example.com");
        assertThat(jwtUtil.extractRole(token)).isEqualTo("ADMIN");
    }

    @Test
    void isTokenValid_trueForMatchingEmailWithinExpiry() {
        JwtUtil jwtUtil = new JwtUtil(TEST_SECRET, 60_000L);
        String token = jwtUtil.generateToken("ada@example.com", "HR");

        assertThat(jwtUtil.isTokenValid(token, "ada@example.com")).isTrue();
    }

    @Test
    void isTokenValid_falseForDifferentEmail() {
        JwtUtil jwtUtil = new JwtUtil(TEST_SECRET, 60_000L);
        String token = jwtUtil.generateToken("ada@example.com", "HR");

        assertThat(jwtUtil.isTokenValid(token, "someoneelse@example.com")).isFalse();
    }

    @Test
    void expiredToken_isRejected() throws InterruptedException {
        JwtUtil jwtUtil = new JwtUtil(TEST_SECRET, 1L); // expires almost immediately
        String token = jwtUtil.generateToken("ada@example.com", "EMPLOYEE");

        Thread.sleep(10);

        assertThat(jwtUtil.isTokenValid(token, "ada@example.com")).isFalse();
    }
}
