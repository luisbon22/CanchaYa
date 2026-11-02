package com.luisbonilla.canchaya.controller;

import com.luisbonilla.canchaya.dto.request.ReservaRequest;
import com.luisbonilla.canchaya.dto.response.ReservaResponse;
import com.luisbonilla.canchaya.entity.EstadoReserva;
import com.luisbonilla.canchaya.security.UsuarioPrincipal;
import com.luisbonilla.canchaya.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.SortDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reservas")
@Tag(name = "Reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CLIENTE')")
    @Operation(summary = "Crea una reserva (CLIENTE)",
            description = "Por horas completas, de 1 a 3 horas, dentro del horario de la cancha. "
                    + "Responde 409 si la franja se solapa con otra reserva confirmada.")
    public ReservaResponse crear(@Valid @RequestBody ReservaRequest request,
                                 @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return reservaService.crear(request, usuario);
    }

    @GetMapping("/mis-reservas")
    @PreAuthorize("hasRole('CLIENTE')")
    @Operation(summary = "Reservas del usuario autenticado (CLIENTE)")
    public Page<ReservaResponse> misReservas(
            @AuthenticationPrincipal UsuarioPrincipal usuario,
            @ParameterObject @PageableDefault(size = 20)
            @SortDefault.SortDefaults({
                    @SortDefault(sort = "fecha", direction = Sort.Direction.DESC),
                    @SortDefault(sort = "horaInicio", direction = Sort.Direction.DESC)
            }) Pageable pageable) {
        return reservaService.misReservas(usuario, pageable);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lista todas las reservas con filtros opcionales (ADMIN)")
    public Page<ReservaResponse> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long canchaId,
            @RequestParam(required = false) EstadoReserva estado,
            @ParameterObject @PageableDefault(size = 20)
            @SortDefault.SortDefaults({
                    @SortDefault(sort = "fecha", direction = Sort.Direction.DESC),
                    @SortDefault(sort = "horaInicio", direction = Sort.Direction.ASC)
            }) Pageable pageable) {
        return reservaService.listar(fecha, canchaId, estado, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de una reserva (dueño o ADMIN)")
    public ReservaResponse obtener(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return reservaService.obtener(id, usuario);
    }

    @PatchMapping("/{id}/cancelar")
    @Operation(summary = "Cancela una reserva (dueño con 24 h de anticipación, o ADMIN en cualquier momento)")
    public ReservaResponse cancelar(@PathVariable Long id, @AuthenticationPrincipal UsuarioPrincipal usuario) {
        return reservaService.cancelar(id, usuario);
    }
}
