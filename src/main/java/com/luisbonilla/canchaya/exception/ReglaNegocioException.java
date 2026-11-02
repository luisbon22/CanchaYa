package com.luisbonilla.canchaya.exception;

/** Regla de negocio incumplida; se traduce a 400 Bad Request. */
public class ReglaNegocioException extends RuntimeException {

    public ReglaNegocioException(String message) {
        super(message);
    }
}
