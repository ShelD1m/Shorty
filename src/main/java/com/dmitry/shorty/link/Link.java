package com.dmitry.shorty.link;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "links", indexes = {
        @Index(name = "ix_links_slug", columnList = "slug", unique = true),
        @Index(name = "ix_links_user", columnList = "user_id")
})
public class Link {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 128)
    private String slug;

    @Column(name = "target_url", nullable = false, length = 4096)
    private String targetUrl;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "max_clicks")
    private Long maxClicks;

    @Column(name = "is_active")
    private Boolean isActive = Boolean.TRUE;


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTargetUrl() { return targetUrl; }
    public void setTargetUrl(String targetUrl) { this.targetUrl = targetUrl; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Long getMaxClicks() { return (maxClicks == null ? 0L : maxClicks); }
    public void setMaxClicks(Long maxClicks) { this.maxClicks = maxClicks; }

    public Boolean getIsActive() { return (isActive == null ? Boolean.TRUE : isActive); }
    public void setIsActive(Boolean active) { this.isActive = active; }

    // equals/hashCode
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Link)) return false;
        Link link = (Link) o;
        return Objects.equals(id, link.id);
    }
    @Override public int hashCode() { return Objects.hash(id); }
}
