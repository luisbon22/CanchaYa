package com.luisbonilla.canchaya.service;

import com.luisbonilla.canchaya.dto.request.LoginRequest;
import com.luisbonilla.canchaya.dto.request.RegisterRequest;
import com.luisbonilla.canchaya.dto.response.AuthResponse;
import com.luisbonilla.canchaya.entity.Rol;
import com.luisbonilla.canchaya.entity.Usuario;
import com.luisbonilla.canchaya.exception.ConflictoException;
import com.luisbonilla.canchaya.repository.UsuarioRepository;
import com.luisbonilla.canchaya.security.JwtService;
import com.luisbonilla.canchaya.security.UsuarioPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    /** Registra siempre con rol CLIENTE: los administradores solo se crean desde la base de datos. */
    @Transactional
    public AuthResponse registrar(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictoException("Ya existe un usuario registrado con ese email");
        }
        Usuario usuario = usuarioRepository.save(new Usuario(request.nombre().trim(), email,
                passwordEncoder.encode(request.password()), Rol.CLIENTE));
        return respuesta(UsuarioPrincipal.from(usuario));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication autenticacion = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim(), request.password()));
        return respuesta((UsuarioPrincipal) autenticacion.getPrincipal());
    }

    private AuthResponse respuesta(UsuarioPrincipal usuario) {
        return new AuthResponse(jwtService.generarToken(usuario), "Bearer", jwtService.getExpiracionMs(),
                usuario.id(), usuario.nombre(), usuario.email(), usuario.rol());
    }
}
