package com.dmitry.shorty.api;

import com.dmitry.shorty.link.LinkRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
public class RedirectController {
    private final LinkRepo links;
    public RedirectController(LinkRepo links){ this.links=links; }

    @GetMapping("/r/{slug}")
    public Object go(@PathVariable String slug){
        var l = links.findBySlug(slug).orElse(null);
        if (l==null || !l.getIsActive()) return ResponseEntity.notFound().build();
        l.setClicksCount(l.getClicksCount() + 1);
        links.save(l);
        return new RedirectView(l.getTargetUrl());
    }

}
