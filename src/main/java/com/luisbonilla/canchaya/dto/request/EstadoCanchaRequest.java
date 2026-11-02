package com.luisbonilla.canchaya.dto.request;

import jakarta.validation.constraints.NotNull;

public record EstadoCanchaRequest(
        @NotNull(message = "Debe indicar si la cancha queda activa")
        Boolean activa
) {
}
