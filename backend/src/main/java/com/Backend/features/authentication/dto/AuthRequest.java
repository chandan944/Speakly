package com.Backend.features.authentication.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
        @NotBlank(message = "Email is mandatory") String email,
        @NotBlank(message = "Password is mandatory") String password
) {
    public String getEmail() {
        return this.email;
    }

    public CharSequence getPassword() {
        return this.password;
    }
}