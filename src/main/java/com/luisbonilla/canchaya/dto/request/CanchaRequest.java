package com.luisbonilla.canchaya.dto.request;

import com.luisbonilla.canchaya.entity.TipoCancha;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalTime;

public record CanchaRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,

        @NotNull(message = "El tipo de cancha es obligatorio")
        TipoCancha tipo,

        @NotNull(message = "El precio por hora es obligatorio")
        @DecimalMin(value = "0", inclusive = false, message = "El precio por hora debe ser mayor a 0")
        @Digits(integer = 10, fraction = 2, message = "El precio por hora no tiene un formato válido")
        BigDecimal precioPorHora,

        @NotNull(message = "La hora de apertura es obligatoria")
        @Schema(type = "string", example = "08:00")
        LocalTime horaApertura,

        @NotNull(message = "La hora de cierre es obligatoria")
        @Schema(type = "string", example = "23:00")
        LocalTime horaCierre
) {
}
