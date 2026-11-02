package com.luisbonilla.canchaya.controller;

import com.luisbonilla.canchaya.dto.request.LoginRequest;
import com.luisbonilla.canchaya.dto.request.RegisterRequest;
import com.luisbonilla.canchaya.dto.response.AuthResponse;
import com.luisbonilla.canchaya.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación")
@SecurityRequirements
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registra un usuario con rol CLIENTE y devuelve su token")
    public AuthResponse registrar(@Valid @RequestBody RegisterRequest request) {
        return authService.registrar(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Inicia sesión y devuelve un token JWT")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
