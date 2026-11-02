package com.luisbonilla.canchaya.service;

import com.luisbonilla.canchaya.dto.request.CanchaRequest;
import com.luisbonilla.canchaya.dto.response.DisponibilidadResponse;
import com.luisbonilla.canchaya.dto.response.DisponibilidadResponse.EstadoFranja;
import com.luisbonilla.canchaya.dto.response.DisponibilidadResponse.Franja;
import com.luisbonilla.canchaya.entity.Cancha;
import com.luisbonilla.canchaya.entity.EstadoReserva;
import com.luisbonilla.canchaya.entity.Reserva;
import com.luisbonilla.canchaya.entity.TipoCancha;
import com.luisbonilla.canchaya.exception.ConflictoException;
import com.luisbonilla.canchaya.exception.ReglaNegocioException;
import com.luisbonilla.canchaya.repository.CanchaRepository;
import com.luisbonilla.canchaya.repository.ReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CanchaServiceTest {

    private static final ZoneId ZONA = ZoneId.of("America/Bogota");
    private static final LocalDateTime AHORA = LocalDateTime.of(2026, 11, 1, 10, 0);

    @Mock
    private CanchaRepository canchaRepository;
    @Mock
    private ReservaRepository reservaRepository;

    private CanchaService service;
    private Cancha cancha;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(AHORA.atZone(ZONA).toInstant(), ZONA);
        service = new CanchaService(canchaRepository, reservaRepository, clock);
        cancha = new Cancha("Cancha Principal", TipoCancha.FUTBOL_5, new BigDecimal("80000"),
                LocalTime.of(8, 0), LocalTime.of(12, 0));
        cancha.setId(1L);
    }

    @Test
    void disponibilidadMarcaFranjasPasadasOcupadasYLibres() {
        LocalDate hoy = AHORA.toLocalDate();
        Reserva ocupada = new Reserva(null, cancha, hoy, LocalTime.of(11, 0), LocalTime.of(12, 0),
                new BigDecimal("80000"));
        when(canchaRepository.findById(1L)).thenReturn(Optional.of(cancha));
        when(reservaRepository.findByCanchaIdAndFechaAndEstado(1L, hoy, EstadoReserva.CONFIRMADA))
                .thenReturn(List.of(ocupada));

        DisponibilidadResponse respuesta = service.disponibilidad(1L, hoy);

        assertThat(respuesta.franjas()).extracting(Franja::horaInicio, Franja::estado).containsExactly(
                tuple(LocalTime.of(8, 0), EstadoFranja.PASADA),
                tuple(LocalTime.of(9, 0), EstadoFranja.PASADA),
                tuple(LocalTime.of(10, 0), EstadoFranja.PASADA),
                tuple(LocalTime.of(11, 0), EstadoFranja.OCUPADA));
    }

    @Test
    void disponibilidadDeUnDiaFuturoSinReservasEstaTodaLibre() {
        LocalDate manana = AHORA.toLocalDate().plusDays(1);
        when(canchaRepository.findById(1L)).thenReturn(Optional.of(cancha));
        when(reservaRepository.findByCanchaIdAndFechaAndEstado(1L, manana, EstadoReserva.CONFIRMADA))
                .thenReturn(List.of());

        DisponibilidadResponse respuesta = service.disponibilidad(1L, manana);

        assertThat(respuesta.franjas()).hasSize(4).allMatch(Franja::libre);
    }

    @Test
    void noCreaCanchaConCierreAnteriorALaApertura() {
        CanchaRequest request = new CanchaRequest("Nueva", TipoCancha.FUTBOL_8, new BigDecimal("100000"),
                LocalTime.of(20, 0), LocalTime.of(8, 0));

        assertThatThrownBy(() -> service.crear(request))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("cierre");
        verify(canchaRepository, never()).save(any());
    }

    @Test
    void noCreaCanchaConNombreRepetido() {
        CanchaRequest request = new CanchaRequest("Cancha Principal", TipoCancha.FUTBOL_5, new BigDecimal("80000"),
                LocalTime.of(8, 0), LocalTime.of(22, 0));
        when(canchaRepository.existsByNombreIgnoreCase("Cancha Principal")).thenReturn(true);

        assertThatThrownBy(() -> service.crear(request)).isInstanceOf(ConflictoException.class);
    }

    @Test
    void cambiarEstadoDesactivaLaCancha() {
        when(canchaRepository.findById(1L)).thenReturn(Optional.of(cancha));

        assertThat(service.cambiarEstado(1L, false).activa()).isFalse();
    }
}
