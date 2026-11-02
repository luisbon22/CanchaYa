package com.luisbonilla.canchaya.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Date;
import java.util.Optional;

/** Emite y valida tokens JWT firmados con HMAC-SHA256. */
@Service
public class JwtService {

    private static final int LONGITUD_MINIMA_CLAVE = 32;

    private final SecretKey clave;
    private final long expiracionMs;
    private final Clock clock;

    public JwtService(JwtProperties properties, Clock clock) {
        if (properties.secret() == null || properties.secret().length() < LONGITUD_MINIMA_CLAVE) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos " + LONGITUD_MINIMA_CLAVE + " caracteres");
        }
        this.clave = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
        this.expiracionMs = properties.expiration();
        this.clock = clock;
    }

    public String generarToken(UsuarioPrincipal usuario) {
        Date ahora = Date.from(clock.instant());
        return Jwts.builder()
                .subject(usuario.email())
                .claim("id", usuario.id())
                .claim("nombre", usuario.nombre())
                .claim("rol", usuario.rol().name())
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + expiracionMs))
                .signWith(clave)
                .compact();
    }

    /** Devuelve el email del token si la firma y la vigencia son válidas. */
    public Optional<String> extraerEmail(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(clave)
                    .clock(() -> Date.from(clock.instant()))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.ofNullable(claims.getSubject());
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public long getExpiracionMs() {
        return expiracionMs;
    }
}
