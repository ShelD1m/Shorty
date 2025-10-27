package com.dmitry.shorty.api.dto.LinkDto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public record CreateLinkRequest(
        @NotBlank String targetUrl,
        String customSlug,
        Instant expiresAt,
        Long maxClicks
) {}
