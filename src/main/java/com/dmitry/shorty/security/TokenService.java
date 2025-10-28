package com.dmitry.shorty.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class TokenService {
    private final byte[] secret;
    private final long expirationSeconds;

    public TokenService(
            @Value("${jwt.secret:}") String secretFromProps,
            @Value("${jwt.expiration-seconds:3600}") long expirationSeconds
    ) {
        String resolved = trimToNull(secretFromProps);
        if (resolved == null) resolved = trimToNull(System.getenv("JWT_SECRET"));
        if (resolved == null) resolved = trimToNull(System.getProperty("jwt.secret"));

        if (resolved == null) {
            throw new IllegalArgumentException(
                    "jwt.secret is not configured. " +
                            "Set one of: application.yml (jwt.secret), ENV JWT_SECRET, or JVM -Djwt.secret=..."
            );
        }
        this.secret = resolved.getBytes();
        this.expirationSeconds = expirationSeconds;
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        s = s.trim();
        return s.isEmpty() ? null : s;
    }

    public String generate(String subject) {
        try {
            Instant now = Instant.now();
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(subject)
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plusSeconds(expirationSeconds)))
                    .build();
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
            SignedJWT jwt = new SignedJWT(header, claims);
            JWSSigner signer = new MACSigner(secret);
            jwt.sign(signer);
            return jwt.serialize();
        } catch (Exception e) {
            throw new IllegalStateException("Cannot sign JWT", e);
        }
    }

    public Optional<String> parseSubject(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            Date exp = jwt.getJWTClaimsSet().getExpirationTime();
            if (exp != null && exp.before(new Date())) return Optional.empty();
            return Optional.ofNullable(jwt.getJWTClaimsSet().getSubject());
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
