package com.dmitry.shorty.api;

import com.dmitry.shorty.api.dto.LinkDto.CreateLinkRequest;
import com.dmitry.shorty.api.dto.LinkDto.LinkResponse;
import com.dmitry.shorty.link.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Random;

@RestController @RequestMapping("/api/links")
public class LinkController {
    private final LinkRepo links;
    public LinkController(LinkRepo links){ this.links=links; }

    @PostMapping
    public ResponseEntity<LinkResponse> create(@Valid @RequestBody CreateLinkRequest req, Principal principal){
        Long userId = Long.valueOf(principal.getName()); // userId in JWT subject
        String slug = (req.customSlug()!=null && !req.customSlug().isBlank()) ? req.customSlug() : genSlug();
        if (links.existsBySlug(slug)) return ResponseEntity.badRequest().build();

        var l = new Link();
        l.setUserId(userId);
        l.setSlug(slug);
        l.setTargetUrl(req.targetUrl());
        l.setExpiresAt(req.expiresAt());
        l.setMaxClicks(req.maxClicks());
        links.save(l);

        return ResponseEntity.ok(new LinkResponse(
                l.getId(), l.getSlug(), "/r/"+l.getSlug(), l.getTargetUrl(),
                l.getIsActive(), l.getExpiresAt(), l.getMaxClicks(),
                l.getClicksCount()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LinkResponse> get(@PathVariable Long id, Principal p){
        var l = links.findById(id).orElse(null);
        if (l==null || !l.getUserId().equals(Long.valueOf(p.getName()))) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(new LinkResponse(
                l.getId(), l.getSlug(), "/r/"+l.getSlug(), l.getTargetUrl(),
                l.getIsActive(), l.getExpiresAt(), l.getMaxClicks(), l.getClicksCount()
        ));
    }

    private static final String ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
    private String genSlug(){
        var r = new Random();
        while(true){
            var sb = new StringBuilder();
            for(int i=0;i<7;i++) sb.append(ALPH.charAt(r.nextInt(ALPH.length())));
            var s = sb.toString();
            if(!links.existsBySlug(s)) return s;
        }
    }
}
