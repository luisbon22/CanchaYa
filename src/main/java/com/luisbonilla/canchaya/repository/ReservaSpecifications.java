package com.luisbonilla.canchaya.repository;

import com.luisbonilla.canchaya.entity.EstadoReserva;
import com.luisbonilla.canchaya.entity.Reserva;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

/** Filtros opcionales para el listado de reservas del administrador. */
public final class ReservaSpecifications {

    private ReservaSpecifications() {
    }

    public static Specification<Reserva> conFiltros(LocalDate fecha, Long canchaId, EstadoReserva estado) {
        return Specification.allOf(fechaIgual(fecha), canchaIgual(canchaId), estadoIgual(estado));
    }

    private static Specification<Reserva> fechaIgual(LocalDate fecha) {
        return fecha == null ? null : (root, query, cb) -> cb.equal(root.get("fecha"), fecha);
    }

    private static Specification<Reserva> canchaIgual(Long canchaId) {
        return canchaId == null ? null : (root, query, cb) -> cb.equal(root.get("cancha").get("id"), canchaId);
    }

    private static Specification<Reserva> estadoIgual(EstadoReserva estado) {
        return estado == null ? null : (root, query, cb) -> cb.equal(root.get("estado"), estado);
    }
}
