package com.dmitry.shorty.api.dto.LinkDto;

import java.time.Instant;

public record LinkResponse(
        Long id, String slug, String shortUrl, String targetUrl,
        boolean isActive, Instant expiresAt, Long maxClicks,
        long clicksCount
) {}
