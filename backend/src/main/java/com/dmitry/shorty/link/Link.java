package com.dmitry.shorty.link;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name="links")
public class Link {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id;
    @Column(nullable=false) Long userId;
    @Column(nullable=false, unique=true, length=32) String slug;
    @Column(nullable=false, columnDefinition="text") String targetUrl;
    @Column(nullable=false) boolean isActive = true;
    Instant expiresAt;
    Long maxClicks;
    @Column(nullable=false) Long clicksCount = 0L;
    @Column(nullable=false) Instant createdAt = Instant.now();
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public Long getUserId(){return userId;} public void setUserId(Long u){this.userId=u;}
    public String getSlug(){return slug;} public void setSlug(String s){this.slug=s;}
    public String getTargetUrl(){return targetUrl;} public void setTargetUrl(String t){this.targetUrl=t;}
    public boolean getIsActive(){return isActive;} public void setIsActive(boolean a){this.isActive=a;}
    public Instant getExpiresAt(){return expiresAt;} public void setExpiresAt(Instant e){this.expiresAt=e;}
    public Long getMaxClicks(){return maxClicks;} public void setMaxClicks(Long m){this.maxClicks=m;}
    public Long getClicksCount(){return clicksCount;} public void setClicksCount(Long c){this.clicksCount=c;}
    public Instant getCreatedAt(){return createdAt;} public void setCreatedAt(Instant c){this.createdAt=c;}
}