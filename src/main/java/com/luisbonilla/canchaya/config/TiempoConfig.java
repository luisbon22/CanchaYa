package com.luisbonilla.canchaya.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * Reloj de la aplicación en la zona horaria del negocio. Inyectarlo en lugar de llamar a now()
 * directamente permite fijar la hora en las pruebas.
 */
@Configuration
public class TiempoConfig {

    @Bean
    public Clock clock(@Value("${app.zona-horaria}") String zonaHoraria) {
        return Clock.system(ZoneId.of(zonaHoraria));
    }
}
