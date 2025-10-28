package com.dmitry.shorty.service;

import com.dmitry.shorty.link.Link;
import com.dmitry.shorty.link.LinkRepo;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClicksCounterService {
    private final StringRedisTemplate redis;
    private final LinkRepo links;

    public ClicksCounterService(StringRedisTemplate redis, LinkRepo links) {
        this.redis = redis;
        this.links = links;
    }

    private String keyClicks(String slug) { return "clicks:" + slug; }
    private String keyDirty() { return "clicks:dirty"; }

    public void increment(String slug) {
        redis.opsForValue().increment(keyClicks(slug), 1);
        redis.opsForSet().add(keyDirty(), slug);
    }

    public long pendingBySlug(String slug) {
        String v = redis.opsForValue().get(keyClicks(slug));
        return (v == null) ? 0L : Long.parseLong(v);
    }

    public long totalClicks(Link l) {
        return l.getClicksCount() + pendingBySlug(l.getSlug());
    }


    @Scheduled(fixedDelay = 60_000)
    public void flushToDb() {
        Set<String> slugs = redis.opsForSet().members(keyDirty());
        if (slugs == null || slugs.isEmpty()) return;

        List<Link> affected = links.findAll().stream()
                .filter(l -> slugs.contains(l.getSlug()))
                .collect(Collectors.toList());

        for (Link l : affected) {
            String k = keyClicks(l.getSlug());
            String val = redis.opsForValue().get(k);
            long delta = (val == null) ? 0L : Long.parseLong(val);
            if (delta > 0) {
                l.setClicksCount(l.getClicksCount() + delta);
                links.save(l);
                redis.opsForValue().set(k, "0");
            }
            redis.opsForSet().remove(keyDirty(), l.getSlug());
        }
    }
}
