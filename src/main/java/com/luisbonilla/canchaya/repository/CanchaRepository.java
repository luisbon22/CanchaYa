package com.luisbonilla.canchaya.repository;

import com.luisbonilla.canchaya.entity.Cancha;
import com.luisbonilla.canchaya.entity.TipoCancha;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CanchaRepository extends JpaRepository<Cancha, Long> {

    /**
     * Bloquea la fila de la cancha (SELECT ... FOR UPDATE) hasta que termine la transacción,
     * de modo que dos reservas simultáneas sobre la misma cancha se validan una detrás de otra.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cancha c where c.id = :id")
    Optional<Cancha> findByIdParaReservar(@Param("id") Long id);

    @Query("""
            select c from Cancha c
            where (:soloActivas = false or c.activa = true)
              and (:tipo is null or c.tipo = :tipo)
            """)
    Page<Cancha> buscar(@Param("tipo") TipoCancha tipo, @Param("soloActivas") boolean soloActivas,
                        Pageable pageable);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    long countByActivaTrue();
}
