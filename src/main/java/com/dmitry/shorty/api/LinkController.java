package com.dmitry.shorty.api;

import com.dmitry.shorty.api.dto.LinkDto.CreateLinkRequest;
import com.dmitry.shorty.api.dto.LinkDto.LinkResponse;
import com.dmitry.shorty.link.Link;
import com.dmitry.shorty.link.LinkRepo;
import com.dmitry.shorty.service.ClicksCounterService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/links")
public class LinkController {

    private final LinkRepo links;
    private final ClicksCounterService counters;

    public LinkController(LinkRepo links, ClicksCounterService counters) {
        this.links = links;
        this.counters = counters;
    }

    @PostMapping
    public ResponseEntity<LinkResponse> create(@Valid @RequestBody CreateLinkRequest req, Principal principal) {
        Long userId = Long.valueOf(principal.getName());
        String slug = (req.customSlug() != null && !req.customSlug().isBlank())
                ? req.customSlug().trim()
                : genSlug();

        if (links.existsBySlug(slug)) {
            return ResponseEntity.badRequest().build();
        }

        Link l = new Link();
        l.setUserId(userId);
        l.setSlug(slug);
        l.setTargetUrl(req.targetUrl());
        l.setExpiresAt(req.expiresAt());
        l.setMaxClicks(req.maxClicks());
        links.save(l);

        return ResponseEntity.ok(toDto(l));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LinkResponse> get(@PathVariable Long id, Principal principal) {
        var l = links.findById(id).orElse(null);
        if (l == null || !l.getUserId().equals(Long.valueOf(principal.getName()))) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toDto(l));
    }

    @GetMapping("/me")
    public ResponseEntity<List<LinkResponse>> myLinks(Principal principal) {
        Long userId = Long.valueOf(principal.getName());
        var list = links.findAll().stream()
                .filter(l -> l.getUserId().equals(userId))
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    private LinkResponse toDto(Link l) {
        long clicks = counters.totalClicks(l);
        return new LinkResponse(
                l.getId(),
                l.getSlug(),
                "/r/" + l.getSlug(),
                l.getTargetUrl(),
                l.getIsActive(),
                l.getExpiresAt(),
                l.getMaxClicks(),
                clicks
        );
    }

    private static final String ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
    private final Random rnd = new Random();

    private String genSlug() {
        while (true) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 7; i++) sb.append(ALPH.charAt(rnd.nextInt(ALPH.length())));
            String s = sb.toString();
            if (!links.existsBySlug(s)) return s;
        }
    }
}
