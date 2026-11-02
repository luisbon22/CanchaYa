package com.luisbonilla.canchaya.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaRequest(
        @NotNull(message = "La cancha es obligatoria")
        Long canchaId,

        @NotNull(message = "La fecha es obligatoria")
        @Schema(example = "2026-11-20")
        LocalDate fecha,

        @NotNull(message = "La hora de inicio es obligatoria")
        @Schema(type = "string", example = "19:00")
        LocalTime horaInicio,

        @NotNull(message = "La hora de fin es obligatoria")
        @Schema(type = "string", example = "21:00")
        LocalTime horaFin
) {
}
