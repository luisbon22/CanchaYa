package com.luisbonilla.canchaya.service;

import com.luisbonilla.canchaya.dto.request.CanchaRequest;
import com.luisbonilla.canchaya.dto.response.CanchaResponse;
import com.luisbonilla.canchaya.dto.response.DisponibilidadResponse;
import com.luisbonilla.canchaya.dto.response.DisponibilidadResponse.EstadoFranja;
import com.luisbonilla.canchaya.dto.response.DisponibilidadResponse.Franja;
import com.luisbonilla.canchaya.entity.Cancha;
import com.luisbonilla.canchaya.entity.EstadoReserva;
import com.luisbonilla.canchaya.entity.Reserva;
import com.luisbonilla.canchaya.entity.TipoCancha;
import com.luisbonilla.canchaya.exception.ConflictoException;
import com.luisbonilla.canchaya.exception.RecursoNoEncontradoException;
import com.luisbonilla.canchaya.exception.ReglaNegocioException;
import com.luisbonilla.canchaya.mapper.CanchaMapper;
import com.luisbonilla.canchaya.repository.CanchaRepository;
import com.luisbonilla.canchaya.repository.ReservaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CanchaService {

    private final CanchaRepository canchaRepository;
    private final ReservaRepository reservaRepository;
    private final Clock clock;

    public CanchaService(CanchaRepository canchaRepository, ReservaRepository reservaRepository, Clock clock) {
        this.canchaRepository = canchaRepository;
        this.reservaRepository = reservaRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public Page<CanchaResponse> listar(TipoCancha tipo, boolean soloActivas, Pageable pageable) {
        return canchaRepository.buscar(tipo, soloActivas, pageable).map(CanchaMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CanchaResponse obtener(Long id) {
        return CanchaMapper.toResponse(buscar(id));
    }

    @Transactional
    public CanchaResponse crear(CanchaRequest request) {
        validarHorario(request);
        String nombre = request.nombre().trim();
        if (canchaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new ConflictoException("Ya existe una cancha con el nombre " + nombre);
        }
        Cancha cancha = new Cancha(nombre, request.tipo(), request.precioPorHora(),
                request.horaApertura(), request.horaCierre());
        return CanchaMapper.toResponse(canchaRepository.save(cancha));
    }

    @Transactional
    public CanchaResponse actualizar(Long id, CanchaRequest request) {
        validarHorario(request);
        Cancha cancha = buscar(id);
        String nombre = request.nombre().trim();
        if (canchaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new ConflictoException("Ya existe una cancha con el nombre " + nombre);
        }
        cancha.actualizar(nombre, request.tipo(), request.precioPorHora(),
                request.horaApertura(), request.horaCierre());
        return CanchaMapper.toResponse(cancha);
    }

    @Transactional
    public CanchaResponse cambiarEstado(Long id, boolean activa) {
        Cancha cancha = buscar(id);
        cancha.setActiva(activa);
        return CanchaMapper.toResponse(cancha);
    }

    /** Divide el horario de la cancha en franjas de una hora y marca cada una como libre, ocupada o pasada. */
    @Transactional(readOnly = true)
    public DisponibilidadResponse disponibilidad(Long id, LocalDate fecha) {
        Cancha cancha = buscar(id);
        List<Reserva> reservas = reservaRepository.findByCanchaIdAndFechaAndEstado(id, fecha,
                EstadoReserva.CONFIRMADA);
        LocalDateTime ahora = LocalDateTime.now(clock);

        List<Franja> franjas = new ArrayList<>();
        for (LocalTime inicio = cancha.getHoraApertura(); inicio.isBefore(cancha.getHoraCierre());
             inicio = inicio.plusHours(1)) {
            LocalTime fin = inicio.plusHours(1);
            franjas.add(new Franja(inicio, fin, estadoFranja(fecha, inicio, fin, reservas, ahora)));
            if (fin.equals(LocalTime.MIDNIGHT)) {
                break;
            }
        }
        return new DisponibilidadResponse(cancha.getId(), cancha.getNombre(), fecha, franjas);
    }

    private EstadoFranja estadoFranja(LocalDate fecha, LocalTime inicio, LocalTime fin, List<Reserva> reservas,
                                      LocalDateTime ahora) {
        if (!fecha.atTime(inicio).isAfter(ahora)) {
            return EstadoFranja.PASADA;
        }
        boolean ocupada = reservas.stream()
                .anyMatch(r -> inicio.isBefore(r.getHoraFin()) && fin.isAfter(r.getHoraInicio()));
        return ocupada ? EstadoFranja.OCUPADA : EstadoFranja.LIBRE;
    }

    private void validarHorario(CanchaRequest request) {
        if (!request.horaCierre().isAfter(request.horaApertura())) {
            throw new ReglaNegocioException("La hora de cierre debe ser posterior a la de apertura");
        }
        if (!enPunto(request.horaApertura()) || !enPunto(request.horaCierre())) {
            throw new ReglaNegocioException("La apertura y el cierre deben ser horas en punto");
        }
    }

    private static boolean enPunto(LocalTime hora) {
        return hora.getMinute() == 0 && hora.getSecond() == 0 && hora.getNano() == 0;
    }

    private Cancha buscar(Long id) {
        return canchaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la cancha " + id));
    }
}
