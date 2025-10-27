package com.dmitry.shorty.api.dto.AuthDto;

public record AuthResponse(String accessToken, long expiresInSec) {}
