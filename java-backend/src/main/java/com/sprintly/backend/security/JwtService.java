package com.sprintly.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final SecretKey secretKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.secretKey = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(CustomUserDetails userDetails) {
        Instant now = Instant.now();

        return Jwts.builder()
            .subject(userDetails.getUsername())
            .claims(Map.of(
                "userId", userDetails.getId().toString(),
                "organizationId", userDetails.getOrganizationId().toString()
            ))
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusMillis(jwtProperties.accessTokenExpiration())))
            .signWith(secretKey)
            .compact();
    }

    public UUID extractUserId(String token) {
        String userId = extractAllClaims(token).get("userId", String.class);
        return UUID.fromString(userId);
    }

    public boolean isTokenValid(String token, CustomUserDetails userDetails) {
        Claims claims = extractAllClaims(token);
        return userDetails.getUsername().equals(claims.getSubject()) && claims.getExpiration().after(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
