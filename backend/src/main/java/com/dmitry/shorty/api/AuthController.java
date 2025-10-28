package com.dmitry.shorty.api;

import com.dmitry.shorty.security.TokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final TokenService tokenService;
    public AuthController(TokenService tokenService) { this.tokenService = tokenService; }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String user) {
        return ResponseEntity.ok(tokenService.generate(user));
    }
}
