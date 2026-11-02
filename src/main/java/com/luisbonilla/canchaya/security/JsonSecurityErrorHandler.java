package com.luisbonilla.canchaya.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.luisbonilla.canchaya.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/** Responde 401 y 403 de la cadena de seguridad con el mismo formato de error que el resto de la API. */
@Component
public class JsonSecurityErrorHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public JsonSecurityErrorHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        escribir(response, request, HttpStatus.UNAUTHORIZED, "Debe iniciar sesión o el token no es válido");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        escribir(response, request, HttpStatus.FORBIDDEN, "No tiene permisos para acceder a este recurso");
    }

    private void escribir(HttpServletResponse response, HttpServletRequest request, HttpStatus status,
                          String mensaje) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getOutputStream(),
                ErrorResponse.of(status, mensaje, request.getRequestURI(), List.of()));
    }
}
