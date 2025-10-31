package com.dmitry.shorty.api;

import com.dmitry.shorty.analytics.ClickEventRepo;
import com.dmitry.shorty.link.LinkRepo;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/links")
public class StatsController {
    private final ClickEventRepo events;
    private final LinkRepo links;

    public StatsController(ClickEventRepo events, LinkRepo links) {
        this.events = events;
        this.links = links;
    }

    private Long uid(Authentication auth) {
        if (auth == null || auth.getName() == null) return null;
        try { return Long.parseLong(auth.getName()); } catch (NumberFormatException e) { return null; }
    }

    @GetMapping("/{id}/clicks")
    public ResponseEntity<?> clicks(@PathVariable Long id,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size,
                                    Authentication auth) {
        var link = links.findById(id).orElse(null);
        if (link == null) return ResponseEntity.notFound().build();
        Long userId = uid(auth);
        if (userId == null || !userId.equals(link.getUserId())) return ResponseEntity.status(403).build();

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(100, size));
        return ResponseEntity.ok(events.findByLinkIdOrderByTsDesc(id, pageable));
    }
}
