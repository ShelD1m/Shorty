package com.dmitry.shorty.service;

import com.dmitry.shorty.link.Link;
import com.dmitry.shorty.link.LinkRepo;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
public class LinkCacheService {
    private final LinkRepo links;
    private final StringRedisTemplate redis;

    public LinkCacheService(LinkRepo links, StringRedisTemplate redis) {
        this.links = links;
        this.redis = redis;
    }

    private String keySlug(String slug) { return "slug:" + slug; }

    public Optional<Link> getBySlugWithCache(String slug) {
        String k = keySlug(slug);
        String target = redis.opsForValue().get(k);
        if (target != null) {
            return links.findBySlug(slug);
        }
        Optional<Link> found = links.findBySlug(slug);
        found.ifPresent(l -> {
            redis.opsForValue().set(k, l.getTargetUrl(), Duration.ofHours(2));
        });
        return found;
    }

    public void invalidateSlug(String slug) {
        redis.delete(keySlug(slug));
    }
}
