package com.luisbonilla.canchaya.security;

import com.luisbonilla.canchaya.entity.Rol;
import com.luisbonilla.canchaya.entity.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/** Usuario autenticado tal como lo ve Spring Security. */
public record UsuarioPrincipal(Long id, String nombre, String email, String password, Rol rol)
        implements UserDetails {

    public static UsuarioPrincipal from(Usuario usuario) {
        return new UsuarioPrincipal(usuario.getId(), usuario.getNombre(), usuario.getEmail(),
                usuario.getPassword(), usuario.getRol());
    }

    public boolean esAdmin() {
        return rol == Rol.ADMIN;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }
}
