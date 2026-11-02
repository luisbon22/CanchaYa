package com.luisbonilla.canchaya.service;

import com.luisbonilla.canchaya.dto.response.ResumenAdminResponse;
import com.luisbonilla.canchaya.entity.EstadoReserva;
import com.luisbonilla.canchaya.repository.CanchaRepository;
import com.luisbonilla.canchaya.repository.ReservaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final ReservaRepository reservaRepository;
    private final CanchaRepository canchaRepository;
    private final Clock clock;

    public AdminService(ReservaRepository reservaRepository, CanchaRepository canchaRepository, Clock clock) {
        this.reservaRepository = reservaRepository;
        this.canchaRepository = canchaRepository;
        this.clock = clock;
    }

    /** Reservas e ingresos del día (sin contar las canceladas) y canchas activas. */
    @Transactional(readOnly = true)
    public ResumenAdminResponse resumenDelDia() {
        LocalDate hoy = LocalDate.now(clock);
        return new ResumenAdminResponse(hoy,
                reservaRepository.countByFechaAndEstadoNot(hoy, EstadoReserva.CANCELADA),
                canchaRepository.countByActivaTrue(),
                reservaRepository.sumarIngresos(hoy, EstadoReserva.CANCELADA));
    }

    /** Cada 15 minutos pasa a COMPLETADA las reservas confirmadas que ya terminaron. */
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void completarReservasVencidas() {
        LocalDateTime ahora = LocalDateTime.now(clock);
        int actualizadas = reservaRepository.completarVencidas(ahora.toLocalDate(), ahora.toLocalTime());
        if (actualizadas > 0) {
            log.info("{} reservas marcadas como completadas", actualizadas);
        }
    }
}
