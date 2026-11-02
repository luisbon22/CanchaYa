package com.luisbonilla.canchaya.controller;

import com.luisbonilla.canchaya.dto.request.CanchaRequest;
import com.luisbonilla.canchaya.dto.request.EstadoCanchaRequest;
import com.luisbonilla.canchaya.dto.response.CanchaResponse;
import com.luisbonilla.canchaya.dto.response.DisponibilidadResponse;
import com.luisbonilla.canchaya.entity.TipoCancha;
import com.luisbonilla.canchaya.security.UsuarioPrincipal;
import com.luisbonilla.canchaya.service.CanchaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/canchas")
@Tag(name = "Canchas")
public class CanchaController {

    private final CanchaService canchaService;

    public CanchaController(CanchaService canchaService) {
        this.canchaService = canchaService;
    }

    @GetMapping
    @Operation(summary = "Lista las canchas activas, con filtro opcional por tipo",
            description = "Un ADMIN puede enviar incluirInactivas=true para ver también las canchas desactivadas.")
    public Page<CanchaResponse> listar(
            @RequestParam(required = false) TipoCancha tipo,
            @RequestParam(defaultValue = "false") boolean incluirInactivas,
            @AuthenticationPrincipal UsuarioPrincipal usuario,
            @ParameterObject @PageableDefault(size = 20, sort = "nombre") Pageable pageable) {
        boolean soloActivas = !(incluirInactivas && usuario.esAdmin());
        return canchaService.listar(tipo, soloActivas, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de una cancha")
    public CanchaResponse obtener(@PathVariable Long id) {
        return canchaService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crea una cancha (ADMIN)")
    public CanchaResponse crear(@Valid @RequestBody CanchaRequest request) {
        return canchaService.crear(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualiza una cancha (ADMIN)")
    public CanchaResponse actualizar(@PathVariable Long id, @Valid @RequestBody CanchaRequest request) {
        return canchaService.actualizar(id, request);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activa o desactiva una cancha (ADMIN)")
    public CanchaResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoCanchaRequest request) {
        return canchaService.cambiarEstado(id, request.activa());
    }

    @GetMapping("/{id}/disponibilidad")
    @Operation(summary = "Franjas de una hora del día con su estado: LIBRE, OCUPADA o PASADA")
    public DisponibilidadResponse disponibilidad(
            @PathVariable Long id,
            @Parameter(example = "2026-11-20")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return canchaService.disponibilidad(id, fecha);
    }
}
