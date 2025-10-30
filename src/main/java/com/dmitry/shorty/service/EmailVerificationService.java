package com.dmitry.shorty.service;

import com.dmitry.shorty.user.User;
import com.dmitry.shorty.user.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import com.dmitry.shorty.service.EmailService;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmailVerificationService {
    private final UserRepo users;
    private final StringRedisTemplate redis;
    private final com.dmitry.shorty.service.EmailService emailService;

    @Value("${app.public-url:http://localhost:8080}")
    private String publicUrl;

    public EmailVerificationService(UserRepo users, StringRedisTemplate redis, EmailService emailService) {
        this.users = users;
        this.redis = redis;
        this.emailService = emailService;
    }

    private String key(String token) { return "verify:" + token; }

    public void issueAndSend(User user) {
        String token = UUID.randomUUID().toString().replace("-", "");
        redis.opsForValue().set(key(token), String.valueOf(user.getId()), Duration.ofHours(24));

        String link = publicUrl + "/verify-email.html?token=" + token;
        String html = """
          <div style="font-family:Inter,system-ui,Arial,sans-serif">
            <h2>Подтверждение e-mail</h2>
            <p>Спасибо за регистрацию в <b>Shorty</b>.</p>
            <p>Подтвердите e-mail по ссылке (действует 24 часа):</p>
            <p><a href="%s" target="_blank">%s</a></p>
            <hr>
            <p style="color:#64748b;font-size:12px">Если это были не вы — проигнорируйте письмо.</p>
          </div>
        """.formatted(link, link);
        emailService.sendHtml(user.getEmail(), "Подтверждение регистрации", html, null);
    }

    public void requestByEmail(String email) {
        users.findByEmail(email).ifPresent(u -> {
            if (!u.isEmailVerified()) issueAndSend(u);
        });
    }

    public boolean confirm(String token) {
        String userId = redis.opsForValue().get(key(token));
        if (userId == null) return false;
        var opt = users.findById(Long.valueOf(userId));
        if (opt.isEmpty()) return false;

        User u = opt.get();
        if (!u.isEmailVerified()) {
            u.setEmailVerified(true);
            users.save(u);
        }
        redis.delete(key(token));
        return true;
    }
}
