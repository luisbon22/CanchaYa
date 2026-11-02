import type { EstadoReserva, Reserva, TipoCancha } from '../api/types'

const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatoCOP(valor: number): string {
  return pesos.format(valor)
}

export const NOMBRE_TIPO: Record<TipoCancha, string> = {
  FUTBOL_5: 'Fútbol 5',
  FUTBOL_8: 'Fútbol 8',
  FUTBOL_11: 'Fútbol 11',
}

export const NOMBRE_ESTADO: Record<EstadoReserva, string> = {
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  COMPLETADA: 'Completada',
}

/** Fecha local en formato ISO (YYYY-MM-DD), sin pasar por UTC. */
export function fechaISO(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function hoyISO(): string {
  return fechaISO(new Date())
}

/** Convierte "2026-11-20" y "19:00" en una fecha local. */
export function aFecha(fecha: string, hora = '00:00'): Date {
  const [y, m, d] = fecha.split('-').map(Number)
  const [h, min] = hora.split(':').map(Number)
  return new Date(y, m - 1, d, h, min)
}

function mayusculaInicial(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function formatoFechaLarga(fecha: string): string {
  return mayusculaInicial(aFecha(fecha).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }))
}

export function formatoFechaCorta(fecha: string): string {
  return mayusculaInicial(aFecha(fecha).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }))
}

export function horario(inicio: string, fin: string): string {
  return `${inicio} – ${fin}`
}

const ANTICIPACION_CANCELACION_MS = 24 * 60 * 60 * 1000

/** Misma regla que el backend: el cliente cancela solo si faltan más de 24 horas. */
export function puedeCancelar(reserva: Reserva, ahora = new Date()): boolean {
  if (reserva.estado !== 'CONFIRMADA') return false
  return aFecha(reserva.fecha, reserva.horaInicio).getTime() - ahora.getTime() >= ANTICIPACION_CANCELACION_MS
}

export function yaTermino(reserva: Reserva, ahora = new Date()): boolean {
  return aFecha(reserva.fecha, reserva.horaFin).getTime() <= ahora.getTime()
}
