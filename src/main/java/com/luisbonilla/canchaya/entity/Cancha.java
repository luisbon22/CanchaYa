package com.luisbonilla.canchaya.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "canchas")
public class Cancha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100, unique = true)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCancha tipo;

    @Column(name = "precio_por_hora", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioPorHora;

    @Column(name = "hora_apertura", nullable = false)
    private LocalTime horaApertura;

    @Column(name = "hora_cierre", nullable = false)
    private LocalTime horaCierre;

    @Column(nullable = false)
    private boolean activa = true;

    protected Cancha() {
    }

    public Cancha(String nombre, TipoCancha tipo, BigDecimal precioPorHora,
                  LocalTime horaApertura, LocalTime horaCierre) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.precioPorHora = precioPorHora;
        this.horaApertura = horaApertura;
        this.horaCierre = horaCierre;
    }

    public void actualizar(String nombre, TipoCancha tipo, BigDecimal precioPorHora,
                           LocalTime horaApertura, LocalTime horaCierre) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.precioPorHora = precioPorHora;
        this.horaApertura = horaApertura;
        this.horaCierre = horaCierre;
    }

    /** Indica si la franja [inicio, fin) cabe dentro del horario de atención. */
    public boolean abiertaEntre(LocalTime inicio, LocalTime fin) {
        return !inicio.isBefore(horaApertura) && !fin.isAfter(horaCierre);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public TipoCancha getTipo() {
        return tipo;
    }

    public BigDecimal getPrecioPorHora() {
        return precioPorHora;
    }

    public LocalTime getHoraApertura() {
        return horaApertura;
    }

    public LocalTime getHoraCierre() {
        return horaCierre;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }
}
