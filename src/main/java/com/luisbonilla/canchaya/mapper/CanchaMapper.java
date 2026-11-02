package com.luisbonilla.canchaya.mapper;

import com.luisbonilla.canchaya.dto.response.CanchaResponse;
import com.luisbonilla.canchaya.entity.Cancha;

public final class CanchaMapper {

    private CanchaMapper() {
    }

    public static CanchaResponse toResponse(Cancha cancha) {
        return new CanchaResponse(cancha.getId(), cancha.getNombre(), cancha.getTipo(), cancha.getPrecioPorHora(),
                cancha.getHoraApertura(), cancha.getHoraCierre(), cancha.isActiva());
    }
}
