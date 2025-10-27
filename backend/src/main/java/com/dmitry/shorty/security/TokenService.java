package com.dmitry.shorty.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Date;
import javax.crypto.SecretKey;

@Service
public class TokenService {
    private final SecretKey key;
    private final long ttlMs;

    public TokenService(@Value("${app.jwt.secret}") String secret,
                        @Value("${app.jwt.ttlSec}") long ttlSec) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.ttlMs = ttlSec * 1000;
    }

    public String issue(Long userId, String role) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(userId.toString())
                .claim("scope", role)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + ttlMs))
                .signWith(key)
                .compact();
    }

    public TokenUser parse(String token) {
        var jws = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
        Long uid = Long.valueOf(jws.getBody().getSubject());
        String role = (String) jws.getBody().get("scope");
        return new TokenUser(uid, role);
    }

    public record TokenUser(Long id, String role) {}
}
