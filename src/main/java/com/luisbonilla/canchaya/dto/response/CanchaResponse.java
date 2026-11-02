package com.luisbonilla.canchaya.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.luisbonilla.canchaya.entity.TipoCancha;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalTime;

public record CanchaResponse(
        Long id,
        String nombre,
        TipoCancha tipo,
        BigDecimal precioPorHora,
        @JsonFormat(pattern = "HH:mm") @Schema(type = "string", example = "08:00")
        LocalTime horaApertura,
        @JsonFormat(pattern = "HH:mm") @Schema(type = "string", example = "23:00")
        LocalTime horaCierre,
        boolean activa
) {
}
