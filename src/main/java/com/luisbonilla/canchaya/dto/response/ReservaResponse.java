package com.luisbonilla.canchaya.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.luisbonilla.canchaya.entity.EstadoReserva;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ReservaResponse(
        Long id,
        Long canchaId,
        String cancha,
        Long usuarioId,
        String usuario,
        LocalDate fecha,
        @JsonFormat(pattern = "HH:mm") @Schema(type = "string", example = "19:00")
        LocalTime horaInicio,
        @JsonFormat(pattern = "HH:mm") @Schema(type = "string", example = "21:00")
        LocalTime horaFin,
        BigDecimal precioTotal,
        EstadoReserva estado,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime fechaCreacion
) {
}
