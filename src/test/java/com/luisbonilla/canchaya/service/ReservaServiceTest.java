package com.luisbonilla.canchaya.service;

import com.luisbonilla.canchaya.dto.request.ReservaRequest;
import com.luisbonilla.canchaya.dto.response.ReservaResponse;
import com.luisbonilla.canchaya.entity.Cancha;
import com.luisbonilla.canchaya.entity.EstadoReserva;
import com.luisbonilla.canchaya.entity.Reserva;
import com.luisbonilla.canchaya.entity.Rol;
import com.luisbonilla.canchaya.entity.TipoCancha;
import com.luisbonilla.canchaya.entity.Usuario;
import com.luisbonilla.canchaya.exception.AccesoDenegadoException;
import com.luisbonilla.canchaya.exception.ConflictoException;
import com.luisbonilla.canchaya.exception.RecursoNoEncontradoException;
import com.luisbonilla.canchaya.exception.ReglaNegocioException;
import com.luisbonilla.canchaya.repository.CanchaRepository;
import com.luisbonilla.canchaya.repository.ReservaRepository;
import com.luisbonilla.canchaya.repository.UsuarioRepository;
import com.luisbonilla.canchaya.security.UsuarioPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    private static final ZoneId ZONA = ZoneId.of("America/Bogota");
    /** "Ahora" fijo para todas las pruebas: 1 de noviembre de 2026, 10:00. */
    private static final LocalDateTime AHORA = LocalDateTime.of(2026, 11, 1, 10, 0);
    private static final LocalDate MANANA = AHORA.toLocalDate().plusDays(1);

    @Mock
    private ReservaRepository reservaRepository;
    @Mock
    private CanchaRepository canchaRepository;
    @Mock
    private UsuarioRepository usuarioRepository;

    private ReservaService service;
    private Cancha cancha;
    private Usuario clienteEntidad;
    private final UsuarioPrincipal cliente = new UsuarioPrincipal(1L, "Ana", "ana@mail.com", "x", Rol.CLIENTE);
    private final UsuarioPrincipal otroCliente = new UsuarioPrincipal(2L, "Juan", "juan@mail.com", "x", Rol.CLIENTE);
    private final UsuarioPrincipal admin = new UsuarioPrincipal(99L, "Admin", "admin@mail.com", "x", Rol.ADMIN);

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(AHORA.atZone(ZONA).toInstant(), ZONA);
        service = new ReservaService(reservaRepository, canchaRepository, usuarioRepository, clock);

        cancha = new Cancha("Cancha Principal", TipoCancha.FUTBOL_5, new BigDecimal("80000"),
                LocalTime.of(8, 0), LocalTime.of(23, 0));
        cancha.setId(1L);

        clienteEntidad = new Usuario("Ana", "ana@mail.com", "x", Rol.CLIENTE);
        clienteEntidad.setId(1L);
    }

    private ReservaRequest solicitud(LocalDate fecha, int inicio, int fin) {
        return new ReservaRequest(1L, fecha, LocalTime.of(inicio, 0), LocalTime.of(fin, 0));
    }

    private Reserva reservaDe(Usuario usuario, LocalDateTime inicio) {
        Reserva reserva = new Reserva(usuario, cancha, inicio.toLocalDate(), inicio.toLocalTime(),
                inicio.toLocalTime().plusHours(1), new BigDecimal("80000"));
        reserva.setId(10L);
        return reserva;
    }

    @Nested
    class Crear {

        @Test
        void creaLaReservaCuandoLaFranjaEstaLibre() {
            when(canchaRepository.findByIdParaReservar(1L)).thenReturn(Optional.of(cancha));
            when(reservaRepository.existeSolapamiento(1L, MANANA, LocalTime.of(19, 0), LocalTime.of(21, 0),
                    EstadoReserva.CONFIRMADA)).thenReturn(false);
            when(usuarioRepository.getReferenceById(1L)).thenReturn(clienteEntidad);
            when(reservaRepository.saveAndFlush(any(Reserva.class))).thenAnswer(inv -> {
                Reserva r = inv.getArgument(0);
                r.setId(15L);
                return r;
            });

            ReservaResponse respuesta = service.crear(solicitud(MANANA, 19, 21), cliente);

            assertThat(respuesta.id()).isEqualTo(15L);
            assertThat(respuesta.cancha()).isEqualTo("Cancha Principal");
            assertThat(respuesta.estado()).isEqualTo(EstadoReserva.CONFIRMADA);
            assertThat(respuesta.horaInicio()).isEqualTo(LocalTime.of(19, 0));
            assertThat(respuesta.horaFin()).isEqualTo(LocalTime.of(21, 0));
        }

        @Test
        void calculaElPrecioTotalComoHorasPorPrecioPorHora() {
            when(canchaRepository.findByIdParaReservar(1L)).thenReturn(Optional.of(cancha));
            when(usuarioRepository.getReferenceById(1L)).thenReturn(clienteEntidad);
            when(reservaRepository.saveAndFlush(any(Reserva.class))).thenAnswer(inv -> inv.getArgument(0));

            ReservaResponse respuesta = service.crear(solicitud(MANANA, 18, 21), cliente);

            ArgumentCaptor<Reserva> captor = ArgumentCaptor.forClass(Reserva.class);
            verify(reservaRepository).saveAndFlush(captor.capture());
            assertThat(captor.getValue().getPrecioTotal()).isEqualByComparingTo("240000");
            assertThat(respuesta.precioTotal()).isEqualByComparingTo("240000");
        }

        @Test
        void lanzaConflictoSiSeSolapaConOtraReserva() {
            when(canchaRepository.findByIdParaReservar(1L)).thenReturn(Optional.of(cancha));
            when(reservaRepository.existeSolapamiento(1L, MANANA, LocalTime.of(19, 0), LocalTime.of(21, 0),
                    EstadoReserva.CONFIRMADA)).thenReturn(true);

            assertThatThrownBy(() -> service.crear(solicitud(MANANA, 19, 21), cliente))
                    .isInstanceOf(ConflictoException.class)
                    .hasMessageContaining("ya está reservada");
            verify(reservaRepository, never()).saveAndFlush(any());
        }

        @Test
        void bloqueaLaCanchaAntesDeValidarElSolapamiento() {
            when(canchaRepository.findByIdParaReservar(1L)).thenReturn(Optional.of(cancha));
            when(usuarioRepository.getReferenceById(1L)).thenReturn(clienteEntidad);
            when(reservaRepository.saveAndFlush(any(Reserva.class))).thenAnswer(inv -> inv.getArgument(0));

            service.crear(solicitud(MANANA, 19, 20), cliente);

            verify(canchaRepository).findByIdParaReservar(1L);
            verify(canchaRepository, never()).findById(anyLong());
        }

        @Test
        void lanzaErrorSiEstaFueraDelHorarioDeLaCancha() {
            when(canchaRepository.findByIdParaReservar(1L)).thenReturn(Optional.of(cancha));

            assertThatThrownBy(() -> service.crear(solicitud(MANANA, 6, 8), cliente))
                    .isInstanceOf(ReglaNegocioException.class)
                    .hasMessageContaining("horario de la cancha");
            assertThatThrownBy(() -> service.crear(solicitud(MANANA, 7, 9), cliente))
                    .isInstanceOf(ReglaNegocioException.class)
                    .hasMessageContaining("horario de la cancha");
        }

        @Test
        void lanzaErrorSiLaFechaEsPasada() {
            assertThatThrownBy(() -> service.crear(solicitud(AHORA.toLocalDate().minusDays(1), 19, 20), cliente))
                    .isInstanceOf(ReglaNegocioException.class)
                    .hasMessageContaining("pasada");
        }

        @Test
        void lanzaErrorSiLaHoraDeHoyYaPaso() {
            assertThatThrownBy(() -> service.crear(solicitud(AHORA.toLocalDate(), 9, 11), cliente))
                    .isInstanceOf(ReglaNegocioException.class)
                    .hasMessageContaining("pasada");
        }

        @Test
        void lanzaErrorSiLaCanchaEstaInactiva() {
            cancha.setActiva(false);
            when(canchaRepository.findByIdParaReservar(1L)).thenReturn(Optional.of(cancha));

            assertThatThrownBy(() -> service.crear(solicitud(MANANA, 19, 20), cliente))
                    .isInstanceOf(ReglaNegocioException.class)
                    .hasMessageContaining("no está disponible");
        }

        @Test
        void lanzaErrorSiLaCanchaNoExiste() {
            when(canchaRepository.findByIdParaReservar(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.crear(solicitud(MANANA, 19, 20), cliente))
                    .isInstanceOf(RecursoNoEncontradoException.class);
        }

        @Test
        void lanzaErrorSiDuraMasDeTresHoras() {
            assertThatThrownBy(() -> service.crear(solicitud(MANANA, 18, 22), cliente))
                    .isInstanceOf(ReglaNegocioException.class)
                    .hasMessageContaining("entre 1 y 3 horas");
        }

        @Test
        void lanzaErrorSiNoEsHoraEnPunto() {
            ReservaRequest request = new ReservaRequest(1L, MANANA, LocalTime.of(19, 30), LocalTime.of(20, 30));

            assertThatThrownBy(() -> service.crear(request, cliente))
                    .isInstanceOf(ReglaNegocioException.class)
                    .hasMessageContaining("horas en punto");
        }

        @Test
        void lanzaErrorSiLaHoraDeFinNoEsPosterior() {
            assertThatThrownBy(() -> service.crear(solicitud(MANANA, 20, 19), cliente))
                    .isInstanceOf(ReglaNegocioException.class)
                    .hasMessageContaining("posterior");
        }
    }

    @Nested
    class Cancelar {

        @Test
        void elClienteCancelaConMasDe24Horas() {
            Reserva reserva = reservaDe(clienteEntidad, AHORA.plusHours(25));
            when(reservaRepository.findWithDetallesById(10L)).thenReturn(Optional.of(reserva));

            ReservaResponse respuesta = service.cancelar(10L, cliente);

            assertThat(respuesta.estado()).isEqualTo(EstadoReserva.CANCELADA);
        }

        @Test
        void elClienteNoPuedeCancelarConMenosDe24Horas() {
            Reserva reserva = reservaDe(clienteEntidad, AHORA.plusHours(23));
            when(reservaRepository.findWithDetallesById(10L)).thenReturn(Optional.of(reserva));

            assertThatThrownBy(() -> service.cancelar(10L, cliente))
                    .isInstanceOf(ReglaNegocioException.class)
                    .hasMessageContaining("24 horas");
            assertThat(reserva.getEstado()).isEqualTo(EstadoReserva.CONFIRMADA);
        }

        @Test
        void elAdminPuedeCancelarConMenosDe24Horas() {
            Reserva reserva = reservaDe(clienteEntidad, AHORA.plusHours(2));
            when(reservaRepository.findWithDetallesById(10L)).thenReturn(Optional.of(reserva));

            ReservaResponse respuesta = service.cancelar(10L, admin);

            assertThat(respuesta.estado()).isEqualTo(EstadoReserva.CANCELADA);
        }

        @Test
        void unClienteNoPuedeCancelarLaReservaDeOtro() {
            Reserva reserva = reservaDe(clienteEntidad, AHORA.plusDays(5));
            when(reservaRepository.findWithDetallesById(10L)).thenReturn(Optional.of(reserva));

            assertThatThrownBy(() -> service.cancelar(10L, otroCliente))
                    .isInstanceOf(AccesoDenegadoException.class);
            assertThat(reserva.getEstado()).isEqualTo(EstadoReserva.CONFIRMADA);
        }

        @Test
        void noSePuedeCancelarUnaReservaYaCancelada() {
            Reserva reserva = reservaDe(clienteEntidad, AHORA.plusDays(5));
            reserva.cancelar();
            when(reservaRepository.findWithDetallesById(10L)).thenReturn(Optional.of(reserva));

            assertThatThrownBy(() -> service.cancelar(10L, admin))
                    .isInstanceOf(ReglaNegocioException.class)
                    .hasMessageContaining("confirmadas");
        }
    }

    @Nested
    class Obtener {

        @Test
        void unClienteNoPuedeVerLaReservaDeOtro() {
            when(reservaRepository.findWithDetallesById(10L))
                    .thenReturn(Optional.of(reservaDe(clienteEntidad, AHORA.plusDays(1))));

            assertThatThrownBy(() -> service.obtener(10L, otroCliente))
                    .isInstanceOf(AccesoDenegadoException.class);
        }

        @Test
        void elDuenoYElAdminPuedenVerLaReserva() {
            when(reservaRepository.findWithDetallesById(eq(10L)))
                    .thenReturn(Optional.of(reservaDe(clienteEntidad, AHORA.plusDays(1))));

            assertThat(service.obtener(10L, cliente).usuarioId()).isEqualTo(1L);
            assertThat(service.obtener(10L, admin).usuarioId()).isEqualTo(1L);
        }
    }
}
