export type Rol = 'ADMIN' | 'CLIENTE'
export type TipoCancha = 'FUTBOL_5' | 'FUTBOL_8' | 'FUTBOL_11'
export type EstadoReserva = 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'
export type EstadoFranja = 'LIBRE' | 'OCUPADA' | 'PASADA'

export interface AuthResponse {
  token: string
  tipo: string
  expiraEnMs: number
  usuarioId: number
  nombre: string
  email: string
  rol: Rol
}

export interface Cancha {
  id: number
  nombre: string
  tipo: TipoCancha
  precioPorHora: number
  horaApertura: string
  horaCierre: string
  activa: boolean
}

export interface CanchaInput {
  nombre: string
  tipo: TipoCancha
  precioPorHora: number
  horaApertura: string
  horaCierre: string
}

export interface Reserva {
  id: number
  canchaId: number
  cancha: string
  usuarioId: number
  usuario: string
  fecha: string
  horaInicio: string
  horaFin: string
  precioTotal: number
  estado: EstadoReserva
  fechaCreacion: string
}

export interface ReservaInput {
  canchaId: number
  fecha: string
  horaInicio: string
  horaFin: string
}

export interface Franja {
  horaInicio: string
  horaFin: string
  estado: EstadoFranja
}

export interface Disponibilidad {
  canchaId: number
  cancha: string
  fecha: string
  franjas: Franja[]
}

export interface ResumenAdmin {
  fecha: string
  reservasHoy: number
  canchasActivas: number
  ingresosHoy: number
}

export interface Page<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  errores?: { campo: string; mensaje: string }[]
}
