package com.dmitry.shorty.api;

import com.dmitry.shorty.link.Link;
import com.dmitry.shorty.service.ClicksCounterService;
import com.dmitry.shorty.service.LinkCacheService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.time.Instant;

@RestController
public class RedirectController {
    private final LinkCacheService cache;
    private final ClicksCounterService counters;

    public RedirectController(LinkCacheService cache, ClicksCounterService counters) {
        this.cache = cache;
        this.counters = counters;
    }

    @GetMapping("/r/{slug}")
    public Object go(@PathVariable String slug){
        var opt = cache.getBySlugWithCache(slug);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Link l = opt.get();
        if (!l.getIsActive()) return ResponseEntity.status(HttpStatus.GONE).build();

        if (l.getExpiresAt() != null && l.getExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.status(HttpStatus.GONE).build();
        }

        long totalNow = counters.totalClicks(l);
        if (l.getMaxClicks() != null && totalNow >= l.getMaxClicks()) {
            return ResponseEntity.status(HttpStatus.GONE).build();
        }

        counters.increment(l.getSlug());
        return new RedirectView(l.getTargetUrl());
    }
}
