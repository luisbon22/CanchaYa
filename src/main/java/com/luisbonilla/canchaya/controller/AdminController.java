package com.luisbonilla.canchaya.controller;

import com.luisbonilla.canchaya.dto.response.ResumenAdminResponse;
import com.luisbonilla.canchaya.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Administración")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/resumen")
    @Operation(summary = "Resumen del día: reservas, canchas activas e ingresos (ADMIN)")
    public ResumenAdminResponse resumen() {
        return adminService.resumenDelDia();
    }
}
