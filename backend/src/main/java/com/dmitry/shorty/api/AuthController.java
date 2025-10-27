package com.dmitry.shorty.api;

import com.dmitry.shorty.api.dto.AuthDto.AuthResponse;
import com.dmitry.shorty.api.dto.AuthDto.LoginRequest;
import com.dmitry.shorty.api.dto.AuthDto.SignupRequest;
import com.dmitry.shorty.user.User;
import com.dmitry.shorty.api.dto.*;
import com.dmitry.shorty.user.*;
import com.dmitry.shorty.user.UserRepo;
import com.dmitry.shorty.security.TokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final UserRepo users;
    private final TokenService tokens;
    private final BCryptPasswordEncoder enc = new BCryptPasswordEncoder(12);

    public AuthController(UserRepo users, TokenService tokens) { this.users = users; this.tokens = tokens; }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req){
        if (users.existsByEmail(req.email())) return ResponseEntity.badRequest().body("email_taken");
        var u = new User(); u.setEmail(req.email()); u.setPasswordHash(enc.encode(req.password()));
        users.save(u);
        var jwt = tokens.issue(u.getId(), u.getRole());
        return ResponseEntity.ok(new AuthResponse(jwt, 3600));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req){
        var u = users.findByEmail(req.email()).orElse(null);
        if (u==null || !enc.matches(req.password(), u.getPasswordHash())) return ResponseEntity.status(401).body("bad_credentials");
        var jwt = tokens.issue(u.getId(), u.getRole());
        return ResponseEntity.ok(new AuthResponse(jwt, 3600));
    }
}
