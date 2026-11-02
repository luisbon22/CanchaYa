import axios from 'axios'
import type { ApiError } from '../api/types'

/** Traduce un error de la API a un mensaje claro para la persona que usa la app. */
export function mensajeDeError(error: unknown, contexto?: 'reserva'): string {
  if (!axios.isAxiosError<ApiError>(error)) {
    return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
  }
  if (!error.response) {
    return 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
  }

  const { status, data } = error.response
  if (status === 409 && contexto === 'reserva') {
    return 'Alguien acaba de reservar esa hora, elige otra.'
  }
  switch (status) {
    case 401:
      return data?.message ?? 'Tu sesión expiró. Vuelve a iniciar sesión.'
    case 403:
      return 'No tienes permisos para hacer esto.'
    case 404:
      return 'No encontramos lo que buscas.'
  }
  if (status >= 500) {
    return 'Algo salió mal de nuestro lado. Inténtalo en unos minutos.'
  }
  if (data?.errores?.length) {
    return data.errores[0].mensaje
  }
  return data?.message ?? 'No se pudo completar la acción.'
}

export function estadoHttp(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}
