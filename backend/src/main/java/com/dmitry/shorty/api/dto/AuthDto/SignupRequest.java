package com.dmitry.shorty.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(@Email @NotBlank String email,
                            @Size(min=6) String password) {}
