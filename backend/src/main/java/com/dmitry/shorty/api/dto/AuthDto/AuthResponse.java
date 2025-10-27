package com.dmitry.shorty.api.dto;

public record AuthResponse(String accessToken, long expiresInSec) {}
