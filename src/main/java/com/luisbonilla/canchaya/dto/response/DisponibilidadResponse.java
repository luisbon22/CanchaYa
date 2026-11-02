package com.luisbonilla.canchaya.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Franjas de una hora entre la apertura y el cierre de la cancha para un día. */
public record DisponibilidadResponse(
        Long canchaId,
        String cancha,
        LocalDate fecha,
        List<Franja> franjas
) {

    public record Franja(
            @JsonFormat(pattern = "HH:mm") @Schema(type = "string", example = "19:00")
            LocalTime horaInicio,
            @JsonFormat(pattern = "HH:mm") @Schema(type = "string", example = "20:00")
            LocalTime horaFin,
            EstadoFranja estado
    ) {

        public boolean libre() {
            return estado == EstadoFranja.LIBRE;
        }
    }

    public enum EstadoFranja {
        LIBRE,
        OCUPADA,
        PASADA
    }
}
