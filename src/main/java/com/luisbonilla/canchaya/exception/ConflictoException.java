package com.luisbonilla.canchaya.exception;

/** Conflicto con el estado actual (reserva solapada, dato duplicado); se traduce a 409 Conflict. */
public class ConflictoException extends RuntimeException {

    public ConflictoException(String message) {
        super(message);
    }
}
