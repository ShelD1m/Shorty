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

    public AuthService(UserRepo users, PasswordEncoder encoder, TokenService tokens) {
        this.users = users; this.encoder = encoder; this.tokens = tokens;
    }

    public void signup(SignupRequest req) {
        if (users.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        var u = new User();
        u.setEmail(req.email());
        u.setPasswordHash(encoder.encode(req.password()));
        users.save(u);
    }

    public AuthResponse login(LoginRequest req) {
        var u = users.findByEmail(req.email()).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!encoder.matches(req.password(), u.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        var token = tokens.generate(String.valueOf(u.getId()));
        return new AuthResponse(token, 3600);
    }
}
