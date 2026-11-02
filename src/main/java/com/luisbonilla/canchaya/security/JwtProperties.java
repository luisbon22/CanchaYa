package com.luisbonilla.canchaya.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param secret     clave HMAC; debe tener al menos 32 caracteres (256 bits)
 * @param expiration vigencia del token en milisegundos
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(String secret, long expiration) {
}
