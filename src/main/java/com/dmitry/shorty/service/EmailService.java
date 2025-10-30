package com.dmitry.shorty.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mail;
    private final String defaultFrom;

    public EmailService(JavaMailSender mail,
                        @Value("${mail.from:noreply@shorty.local}") String defaultFrom) {
        this.mail = mail;
        this.defaultFrom = defaultFrom;
    }

    public void send(String to, String subject, String text) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(defaultFrom);
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);
        mail.send(msg);
    }

    public void sendHtml(String to, String subject, String html, @Nullable String plain) {
        try {
            MimeMessage mm = mail.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(mm, true, "UTF-8");
            h.setFrom(defaultFrom);
            h.setTo(to);
            h.setSubject(subject);
            if (plain == null || plain.isBlank()) plain = html.replaceAll("<[^>]+>", "");
            h.setText(plain, html);
            mail.send(mm);
        } catch (MessagingException e) {
            throw new IllegalStateException("Failed to send email", e);
        }
    }
}
