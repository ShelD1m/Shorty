package com.dmitry.shorty.api;

import com.dmitry.shorty.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/password")
public class PasswordResetController {
    private final PasswordResetService service;

    public PasswordResetController(PasswordResetService service) {
        this.service = service;
    }

    @PostMapping("/forgot")
    public ResponseEntity<?> forgot(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        if (email.isEmpty()) return ResponseEntity.badRequest().build();
        service.requestReset(email);
        return ResponseEntity.ok(Map.of("message", "Если e-mail существует, ссылка отправлена"));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> reset(@RequestBody Map<String, String> body) {
        String token = body.getOrDefault("token", "").trim();
        String newPassword = body.getOrDefault("newPassword", "").trim();
        if (token.isEmpty() || newPassword.length() < 6) return ResponseEntity.badRequest().build();
        boolean ok = service.resetPassword(token, newPassword);
        if (!ok) return ResponseEntity.badRequest().body(Map.of("error","Неверный или просроченный токен"));
        return ResponseEntity.ok(Map.of("message","Пароль обновлён"));
    }
}
