package com.dmitry.shorty.service;

import com.dmitry.shorty.user.User;
import com.dmitry.shorty.user.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    private final UserRepo users;
    private final StringRedisTemplate redis;
    private final PasswordEncoder encoder;
    private final com.dmitry.shorty.service.EmailService emailService;

    @Value("${app.public-url:http://localhost:8080}")
    private String publicUrl;

    public PasswordResetService(UserRepo users, StringRedisTemplate redis,
                                PasswordEncoder encoder, EmailService emailService) {
        this.users = users;
        this.redis = redis;
        this.encoder = encoder;
        this.emailService = emailService;
    }

    private String key(String token) { return "pwdreset:" + token; }

    public void requestReset(String email) {
        users.findByEmail(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString().replace("-", "");
            redis.opsForValue().set(key(token), String.valueOf(user.getId()), Duration.ofMinutes(15));

            String link = publicUrl + "/reset-password.html?token=" + token;
            String html = """
              <div style="font-family:Inter,system-ui,Arial,sans-serif">
                <h2>Сброс пароля</h2>
                <p>Вы запросили сброс пароля для <b>Shorty</b>.</p>
                <p>Ссылка (действует 15 минут):</p>
                <p><a href="%s" target="_blank">%s</a></p>
                <hr>
                <p style="color:#64748b;font-size:12px">Если это были не вы — проигнорируйте письмо.</p>
              </div>
            """.formatted(link, link);
            emailService.sendHtml(user.getEmail(), "Сброс пароля", html, null);
        });
    }

    public boolean resetPassword(String token, String newPassword) {
        String userId = redis.opsForValue().get(key(token));
        if (userId == null) return false;
        Optional<User> u = users.findById(Long.valueOf(userId));
        if (u.isEmpty()) return false;
        User user = u.get();
        user.setPasswordHash(encoder.encode(newPassword));
        users.save(user);
        redis.delete(key(token));
        return true;
    }
}
