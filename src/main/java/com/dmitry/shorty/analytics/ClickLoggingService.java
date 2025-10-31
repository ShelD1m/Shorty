package com.dmitry.shorty.analytics;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

@Service
public class ClickLoggingService {
    private final ClickEventRepo repo;

    public ClickLoggingService(ClickEventRepo repo) { this.repo = repo; }

    public void log(Long linkId, HttpServletRequest req) {
        ClickEvent ev = new ClickEvent();
        ev.setLinkId(linkId);
        ev.setIp(clientIp(req));
        ev.setUserAgent(req.getHeader("User-Agent"));
        ev.setAcceptLang(header(req, "Accept-Language"));
        ev.setReferer(header(req, "Referer"));

        ev.setUtmSource(req.getParameter("utm_source"));
        ev.setUtmMedium(req.getParameter("utm_medium"));
        ev.setUtmCampaign(req.getParameter("utm_campaign"));
        ev.setUtmTerm(req.getParameter("utm_term"));
        ev.setUtmContent(req.getParameter("utm_content"));

        String ua = (ev.getUserAgent() == null ? "" : ev.getUserAgent()).toLowerCase();
        ev.setDeviceType(ua.contains("mobile") ? "mobile" :
                ua.contains("tablet") ? "tablet" :
                        (ua.contains("bot")||ua.contains("spider")||ua.contains("crawl")) ? "bot" : "desktop");
        if (ua.contains("windows")) ev.setOs("Windows");
        else if (ua.contains("android")) ev.setOs("Android");
        else if (ua.contains("iphone") || ua.contains("ios")) ev.setOs("iOS");
        else if (ua.contains("mac os") || ua.contains("macintosh")) ev.setOs("macOS");
        else if (ua.contains("linux")) ev.setOs("Linux");
        else ev.setOs("Unknown");

        if (ua.contains("chrome")) ev.setBrowser("Chrome");
        else if (ua.contains("safari")) ev.setBrowser("Safari");
        else if (ua.contains("firefox")) ev.setBrowser("Firefox");
        else if (ua.contains("edge")) ev.setBrowser("Edge");
        else ev.setBrowser("Other");

        repo.save(ev);
    }

    private static String header(HttpServletRequest r, String name) {
        String v = r.getHeader(name);
        return v == null ? null : (v.length() > 1024 ? v.substring(0, 1024) : v);
    }

    private static String clientIp(HttpServletRequest r) {
        String xff = r.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        String xri = r.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) return xri.trim();
        return r.getRemoteAddr();
    }
}
