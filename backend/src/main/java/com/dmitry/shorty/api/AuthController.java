package com.dmitry.shorty.api;

import com.dmitry.shorty.api.dto.AuthDto.AuthResponse;
import com.dmitry.shorty.api.dto.AuthDto.LoginRequest;
import com.dmitry.shorty.api.dto.AuthDto.SignupRequest;
import com.dmitry.shorty.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;


    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(value = "/login", consumes = "application/json", produces = "application/json")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        try {
            AuthResponse authResponse = authService.login(req);
            return ResponseEntity.ok(authResponse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping(value = "/register", consumes = "application/json")
    public ResponseEntity<Void> register(@Valid @RequestBody SignupRequest req) {
        try {
            authService.signup(req);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}