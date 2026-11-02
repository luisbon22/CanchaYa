package com.luisbonilla.canchaya.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Indicadores del día para el panel de administración. */
public record ResumenAdminResponse(
        LocalDate fecha,
        long reservasHoy,
        long canchasActivas,
        BigDecimal ingresosHoy
) {
}
