package com.luisbonilla.canchaya.exception;

/** Se traduce a 404 Not Found. */
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String message) {
        super(message);
    }
}
