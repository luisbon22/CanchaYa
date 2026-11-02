package com.luisbonilla.canchaya.service;

import com.luisbonilla.canchaya.dto.request.ReservaRequest;
import com.luisbonilla.canchaya.dto.response.ReservaResponse;
import com.luisbonilla.canchaya.entity.Cancha;
import com.luisbonilla.canchaya.entity.EstadoReserva;
import com.luisbonilla.canchaya.entity.Reserva;
import com.luisbonilla.canchaya.entity.Usuario;
import com.luisbonilla.canchaya.exception.AccesoDenegadoException;
import com.luisbonilla.canchaya.exception.ConflictoException;
import com.luisbonilla.canchaya.exception.RecursoNoEncontradoException;
import com.luisbonilla.canchaya.exception.ReglaNegocioException;
import com.luisbonilla.canchaya.mapper.ReservaMapper;
import com.luisbonilla.canchaya.repository.CanchaRepository;
import com.luisbonilla.canchaya.repository.ReservaRepository;
import com.luisbonilla.canchaya.repository.ReservaSpecifications;
import com.luisbonilla.canchaya.repository.UsuarioRepository;
import com.luisbonilla.canchaya.security.UsuarioPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class ReservaService {

    static final int DURACION_MINIMA_HORAS = 1;
    static final int DURACION_MAXIMA_HORAS = 3;
    static final int ANTICIPACION_CANCELACION_HORAS = 24;

    private final ReservaRepository reservaRepository;
    private final CanchaRepository canchaRepository;
    private final UsuarioRepository usuarioRepository;
    private final Clock clock;

    public ReservaService(ReservaRepository reservaRepository, CanchaRepository canchaRepository,
                         UsuarioRepository usuarioRepository, Clock clock) {
        this.reservaRepository = reservaRepository;
        this.canchaRepository = canchaRepository;
        this.usuarioRepository = usuarioRepository;
        this.clock = clock;
    }

    /**
     * Crea una reserva. La cancha se bloquea (PESSIMISTIC_WRITE) antes de comprobar el solapamiento,
     * así la verificación y el guardado ocurren de forma atómica dentro de la misma transacción.
     */
    @Transactional
    public ReservaResponse crear(ReservaRequest request, UsuarioPrincipal usuario) {
        long horas = validarHorario(request.fecha(), request.horaInicio(), request.horaFin());

        Cancha cancha = canchaRepository.findByIdParaReservar(request.canchaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la cancha " + request.canchaId()));
        if (!cancha.isActiva()) {
            throw new ReglaNegocioException("La cancha no está disponible para reservas");
        }
        if (!cancha.abiertaEntre(request.horaInicio(), request.horaFin())) {
            throw new ReglaNegocioException("La reserva debe estar dentro del horario de la cancha ("
                    + cancha.getHoraApertura() + " - " + cancha.getHoraCierre() + ")");
        }
        if (reservaRepository.existeSolapamiento(cancha.getId(), request.fecha(), request.horaInicio(),
                request.horaFin(), EstadoReserva.CONFIRMADA)) {
            throw new ConflictoException("La cancha ya está reservada en ese horario");
        }

        Usuario cliente = usuarioRepository.getReferenceById(usuario.id());
        BigDecimal precioTotal = cancha.getPrecioPorHora().multiply(BigDecimal.valueOf(horas));
        Reserva reserva = new Reserva(cliente, cancha, request.fecha(), request.horaInicio(), request.horaFin(),
                precioTotal);
        // saveAndFlush hace que una violación de la restricción de exclusión se detecte aquí y no al confirmar
        Reserva guardada = reservaRepository.saveAndFlush(reserva);
        return new ReservaResponse(guardada.getId(), cancha.getId(), cancha.getNombre(), usuario.id(),
                usuario.nombre(), guardada.getFecha(), guardada.getHoraInicio(), guardada.getHoraFin(),
                guardada.getPrecioTotal(), guardada.getEstado(), guardada.getFechaCreacion());
    }

    @Transactional(readOnly = true)
    public ReservaResponse obtener(Long id, UsuarioPrincipal usuario) {
        Reserva reserva = buscar(id);
        verificarAcceso(reserva, usuario);
        return ReservaMapper.toResponse(reserva);
    }

    @Transactional(readOnly = true)
    public Page<ReservaResponse> misReservas(UsuarioPrincipal usuario, Pageable pageable) {
        return reservaRepository.findByUsuarioId(usuario.id(), pageable).map(ReservaMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ReservaResponse> listar(LocalDate fecha, Long canchaId, EstadoReserva estado, Pageable pageable) {
        return reservaRepository.findAll(ReservaSpecifications.conFiltros(fecha, canchaId, estado), pageable)
                .map(ReservaMapper::toResponse);
    }

    /** El cliente solo cancela sus reservas y con 24 horas de anticipación; el administrador, siempre. */
    @Transactional
    public ReservaResponse cancelar(Long id, UsuarioPrincipal usuario) {
        Reserva reserva = buscar(id);
        verificarAcceso(reserva, usuario);
        if (reserva.getEstado() != EstadoReserva.CONFIRMADA) {
            throw new ReglaNegocioException("Solo se pueden cancelar reservas confirmadas");
        }
        if (!usuario.esAdmin()) {
            LocalDateTime limite = LocalDateTime.now(clock).plusHours(ANTICIPACION_CANCELACION_HORAS);
            if (reserva.inicio().isBefore(limite)) {
                throw new ReglaNegocioException("Solo puede cancelar con al menos "
                        + ANTICIPACION_CANCELACION_HORAS + " horas de anticipación");
            }
        }
        reserva.cancelar();
        return ReservaMapper.toResponse(reserva);
    }

    /** Valida las reglas de horario que no dependen de la base de datos y devuelve la duración en horas. */
    private long validarHorario(LocalDate fecha, LocalTime inicio, LocalTime fin) {
        if (!enPunto(inicio) || !enPunto(fin)) {
            throw new ReglaNegocioException("Las reservas deben iniciar y terminar en horas en punto");
        }
        if (!fin.isAfter(inicio)) {
            throw new ReglaNegocioException("La hora de fin debe ser posterior a la hora de inicio");
        }
        long horas = Duration.between(inicio, fin).toHours();
        if (horas < DURACION_MINIMA_HORAS || horas > DURACION_MAXIMA_HORAS) {
            throw new ReglaNegocioException("La reserva debe durar entre " + DURACION_MINIMA_HORAS + " y "
                    + DURACION_MAXIMA_HORAS + " horas");
        }
        if (!fecha.atTime(inicio).isAfter(LocalDateTime.now(clock))) {
            throw new ReglaNegocioException("No se puede reservar en una fecha u hora pasada");
        }
        return horas;
    }

    private void verificarAcceso(Reserva reserva, UsuarioPrincipal usuario) {
        if (!usuario.esAdmin() && !reserva.perteneceA(usuario.id())) {
            throw new AccesoDenegadoException("No tiene permisos sobre esta reserva");
        }
    }

    private static boolean enPunto(LocalTime hora) {
        return hora.getMinute() == 0 && hora.getSecond() == 0 && hora.getNano() == 0;
    }

    private Reserva buscar(Long id) {
        return reservaRepository.findWithDetallesById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la reserva " + id));
    }
}
