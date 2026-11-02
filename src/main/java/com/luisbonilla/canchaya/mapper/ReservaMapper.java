package com.luisbonilla.canchaya.mapper;

import com.luisbonilla.canchaya.dto.response.ReservaResponse;
import com.luisbonilla.canchaya.entity.Reserva;

public final class ReservaMapper {

    private ReservaMapper() {
    }

    public static ReservaResponse toResponse(Reserva reserva) {
        return new ReservaResponse(
                reserva.getId(),
                reserva.getCancha().getId(),
                reserva.getCancha().getNombre(),
                reserva.getUsuario().getId(),
                reserva.getUsuario().getNombre(),
                reserva.getFecha(),
                reserva.getHoraInicio(),
                reserva.getHoraFin(),
                reserva.getPrecioTotal(),
                reserva.getEstado(),
                reserva.getFechaCreacion());
    }
}
