package com.luisbonilla.canchaya.dto.response;

import com.luisbonilla.canchaya.entity.Rol;

public record AuthResponse(
        String token,
        String tipo,
        long expiraEnMs,
        Long usuarioId,
        String nombre,
        String email,
        Rol rol
) {
}
