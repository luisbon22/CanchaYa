package com.luisbonilla.canchaya.security;

import com.luisbonilla.canchaya.entity.Rol;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String CLAVE = "clave-de-prueba-con-al-menos-32-caracteres";
    private static final Instant AHORA = Instant.parse("2026-11-01T15:00:00Z");

    private final UsuarioPrincipal usuario = new UsuarioPrincipal(1L, "Ana", "ana@mail.com", "x", Rol.CLIENTE);

    private JwtService servicio(String clave, Instant instante) {
        return new JwtService(new JwtProperties(clave, 3_600_000), Clock.fixed(instante, ZoneOffset.UTC));
    }

    @Test
    void elTokenGeneradoContieneElEmail() {
        JwtService jwt = servicio(CLAVE, AHORA);

        assertThat(jwt.extraerEmail(jwt.generarToken(usuario))).contains("ana@mail.com");
    }

    @Test
    void rechazaUnTokenVencido() {
        String token = servicio(CLAVE, AHORA).generarToken(usuario);

        assertThat(servicio(CLAVE, AHORA.plusSeconds(3_601)).extraerEmail(token)).isEmpty();
    }

    @Test
    void rechazaUnTokenFirmadoConOtraClave() {
        String token = servicio("otra-clave-distinta-con-mas-de-32-caracteres", AHORA).generarToken(usuario);

        assertThat(servicio(CLAVE, AHORA).extraerEmail(token)).isEmpty();
    }

    @Test
    void rechazaTextoQueNoEsUnToken() {
        assertThat(servicio(CLAVE, AHORA).extraerEmail("no-es-un-jwt")).isEmpty();
    }

    @Test
    void exigeUnaClaveDeAlMenos32Caracteres() {
        assertThatThrownBy(() -> servicio("corta", AHORA)).isInstanceOf(IllegalStateException.class);
    }
}
