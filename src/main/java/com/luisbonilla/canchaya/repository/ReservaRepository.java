package com.luisbonilla.canchaya.repository;

import com.luisbonilla.canchaya.entity.EstadoReserva;
import com.luisbonilla.canchaya.entity.Reserva;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ReservaRepository extends JpaRepository<Reserva, Long>, JpaSpecificationExecutor<Reserva> {

    /** Condición de solapamiento: nuevaInicio < existenteFin AND nuevaFin > existenteInicio. */
    @Query("""
            select count(r) > 0 from Reserva r
            where r.cancha.id = :canchaId
              and r.fecha = :fecha
              and r.estado = :estado
              and r.horaInicio < :horaFin
              and r.horaFin > :horaInicio
            """)
    boolean existeSolapamiento(@Param("canchaId") Long canchaId, @Param("fecha") LocalDate fecha,
                               @Param("horaInicio") LocalTime horaInicio, @Param("horaFin") LocalTime horaFin,
                               @Param("estado") EstadoReserva estado);

    List<Reserva> findByCanchaIdAndFechaAndEstado(Long canchaId, LocalDate fecha, EstadoReserva estado);

    @EntityGraph(attributePaths = {"cancha", "usuario"})
    Optional<Reserva> findWithDetallesById(Long id);

    @EntityGraph(attributePaths = {"cancha", "usuario"})
    Page<Reserva> findByUsuarioId(Long usuarioId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"cancha", "usuario"})
    Page<Reserva> findAll(Specification<Reserva> spec, Pageable pageable);

    long countByFechaAndEstadoNot(LocalDate fecha, EstadoReserva estado);

    @Query("""
            select coalesce(sum(r.precioTotal), 0) from Reserva r
            where r.fecha = :fecha and r.estado <> :excluido
            """)
    BigDecimal sumarIngresos(@Param("fecha") LocalDate fecha, @Param("excluido") EstadoReserva excluido);

    /** Marca como completadas las reservas confirmadas cuya hora de fin ya pasó. */
    @Modifying
    @Query("""
            update Reserva r set r.estado = com.luisbonilla.canchaya.entity.EstadoReserva.COMPLETADA
            where r.estado = com.luisbonilla.canchaya.entity.EstadoReserva.CONFIRMADA
              and (r.fecha < :hoy or (r.fecha = :hoy and r.horaFin <= :ahora))
            """)
    int completarVencidas(@Param("hoy") LocalDate hoy, @Param("ahora") LocalTime ahora);
}
