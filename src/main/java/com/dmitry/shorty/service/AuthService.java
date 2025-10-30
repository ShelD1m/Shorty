package com.dmitry.shorty.service;

import com.dmitry.shorty.api.dto.AuthDto.AuthResponse;
import com.dmitry.shorty.api.dto.AuthDto.LoginRequest;
import com.dmitry.shorty.api.dto.AuthDto.SignupRequest;
import com.dmitry.shorty.security.TokenService;
import com.dmitry.shorty.user.User;
import com.dmitry.shorty.user.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepo users;
    private final PasswordEncoder encoder;
    private final TokenService tokens;
    private final EmailVerificationService emailVerification;

    public AuthService(UserRepo users, PasswordEncoder encoder, TokenService tokens, EmailVerificationService emailVerification) {
        this.users = users;
        this.encoder = encoder;
        this.tokens = tokens;
        this.emailVerification = emailVerification;
    }

    public void signup(SignupRequest req) {
        if (users.existsByEmail(req.email()))
            throw new IllegalArgumentException("Email already registered");

        User u = new User();
        u.setEmail(req.email().trim().toLowerCase());
        u.setPasswordHash(encoder.encode(req.password()));
        u.setEmailVerified(false);
        users.save(u);

        emailVerification.issueAndSend(u);
    }

    public AuthResponse login(LoginRequest req) {
        var user = users.findByEmail(req.email().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!encoder.matches(req.password(), user.getPasswordHash()))
            throw new IllegalArgumentException("Invalid credentials");

        if (!user.isEmailVerified())
            throw new IllegalStateException("Email not verified");

        var token = tokens.generate(String.valueOf(user.getId()));
        return new AuthResponse(token, 3600);
    }
}
