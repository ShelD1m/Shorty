package com.dmitry.shorty.api;

import com.dmitry.shorty.analytics.ClickLoggingService;
import com.dmitry.shorty.link.Link;
import com.dmitry.shorty.link.LinkRepo;
import com.dmitry.shorty.service.ClicksCounterService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller
public class RedirectController {

    private final LinkRepo links;
    private final ClicksCounterService counter;
    private final ClickLoggingService clicks;

    public RedirectController(LinkRepo links,
                              ClicksCounterService counter,
                              ClickLoggingService clicks) {
        this.links = links;
        this.counter = counter;
        this.clicks = clicks;
    }

    @GetMapping("/r/{slug}")
    public String redirect(@PathVariable String slug, HttpServletRequest req) {
        Optional<Link> opt = links.findBySlug(slug);
        if (opt.isEmpty()) throw new NotFound();
        Link link = opt.get();

        // доступна ли ссылка?
        if (!counter.isAvailable(link)) throw new NotFound();

        // лог клика
        clicks.log(link.getId(), req);

        // инкремент счётчика
        try { counter.increment(slug); } catch (Exception ignored) {}

        String target = link.getTargetUrl();
        if (!target.startsWith("http://") && !target.startsWith("https://")) {
            target = "http://" + target;
        }
        return "redirect:" + target;
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    private static class NotFound extends RuntimeException {}
}
