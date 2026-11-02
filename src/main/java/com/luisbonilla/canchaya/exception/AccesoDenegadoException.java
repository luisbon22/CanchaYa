package com.luisbonilla.canchaya.exception;

/** El usuario está autenticado pero no puede operar sobre el recurso; se traduce a 403 Forbidden. */
public class AccesoDenegadoException extends RuntimeException {

    public AccesoDenegadoException(String message) {
        super(message);
    }
}
