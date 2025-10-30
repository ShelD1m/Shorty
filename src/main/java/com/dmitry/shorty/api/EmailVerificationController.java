package com.dmitry.shorty.api;

import com.dmitry.shorty.service.EmailVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/verify")
public class EmailVerificationController {
    private final EmailVerificationService service;

    public EmailVerificationController(EmailVerificationService service) {
        this.service = service;
    }

    @PostMapping("/request")
    public ResponseEntity<?> request(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        if (email.isEmpty()) return ResponseEntity.badRequest().build();
        service.requestByEmail(email);
        return ResponseEntity.ok(Map.of("message","Если почта найдена, письмо отправлено"));
    }

    @GetMapping("/confirm")
    public ResponseEntity<?> confirm(@RequestParam("token") String token) {
        boolean ok = service.confirm(token.trim());
        if (!ok) return ResponseEntity.badRequest().body(Map.of("error","Неверный или просроченный токен"));
        return ResponseEntity.ok(Map.of("message","E-mail подтверждён"));
    }
}
