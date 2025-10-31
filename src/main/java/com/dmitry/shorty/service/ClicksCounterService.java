package com.dmitry.shorty.service;

import com.dmitry.shorty.link.Link;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Objects;

@Service
public class ClicksCounterService {

    private static final String KEY_PREFIX = "shorty:clicks:";

    private final StringRedisTemplate redis;

    public ClicksCounterService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void increment(String slug) {
        Objects.requireNonNull(slug, "slug");
        redis.opsForValue().increment(key(slug));
    }

    public long currentClicks(String slug) {
        Objects.requireNonNull(slug, "slug");
        String v = redis.opsForValue().get(key(slug));
        if (v == null || v.isBlank()) return 0L;
        try {
            return Long.parseLong(v);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

       public long totalClicks(Link link) {
        if (link == null) return 0L;

        long current = currentClicks(link.getSlug());

        Long rawMax = safeLong(link.getMaxClicks());
        long max = (rawMax == null || rawMax <= 0) ? Long.MAX_VALUE : rawMax;

        return Math.min(current, max);
    }

    public boolean isAvailable(Link link) {
        if (link == null) return false;

        Boolean active = link.getIsActive();
        if (active != null && !active) return false;

        if (link.getExpiresAt() != null && link.getExpiresAt().isBefore(Instant.now())) return false;

        Long rawMax = safeLong(link.getMaxClicks());
        if (rawMax != null && rawMax > 0) {
            long current = currentClicks(link.getSlug());
            if (current >= rawMax) return false;
        }

        return true;
            }

    public void reset(String slug) {
        Objects.requireNonNull(slug, "slug");
        redis.delete(key(slug));
    }


    private static String key(String slug) {
        return KEY_PREFIX + slug;
    }

    private static Long safeLong(Long v) {
        return v;
    }
}
