import { api } from './client'
import type {
  AuthResponse,
  Cancha,
  CanchaInput,
  Disponibilidad,
  EstadoReserva,
  Page,
  Reserva,
  ReservaInput,
  ResumenAdmin,
  TipoCancha,
} from './types'

export const authApi = {
  login: (datos: { email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login', datos).then((r) => r.data),
  registrar: (datos: { nombre: string; email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/register', datos).then((r) => r.data),
}

export const canchasApi = {
  listar: (params: { tipo?: TipoCancha; incluirInactivas?: boolean; page?: number; size?: number } = {}) =>
    api.get<Page<Cancha>>('/api/canchas', { params }).then((r) => r.data),
  obtener: (id: number) => api.get<Cancha>(`/api/canchas/${id}`).then((r) => r.data),
  crear: (datos: CanchaInput) => api.post<Cancha>('/api/canchas', datos).then((r) => r.data),
  actualizar: (id: number, datos: CanchaInput) =>
    api.put<Cancha>(`/api/canchas/${id}`, datos).then((r) => r.data),
  cambiarEstado: (id: number, activa: boolean) =>
    api.patch<Cancha>(`/api/canchas/${id}/estado`, { activa }).then((r) => r.data),
  disponibilidad: (id: number, fecha: string) =>
    api.get<Disponibilidad>(`/api/canchas/${id}/disponibilidad`, { params: { fecha } }).then((r) => r.data),
}

export const reservasApi = {
  crear: (datos: ReservaInput) => api.post<Reserva>('/api/reservas', datos).then((r) => r.data),
  misReservas: (params: { page?: number; size?: number } = {}) =>
    api.get<Page<Reserva>>('/api/reservas/mis-reservas', { params }).then((r) => r.data),
  listar: (
    params: { fecha?: string; canchaId?: number; estado?: EstadoReserva; page?: number; size?: number } = {},
  ) => api.get<Page<Reserva>>('/api/reservas', { params }).then((r) => r.data),
  cancelar: (id: number) => api.patch<Reserva>(`/api/reservas/${id}/cancelar`).then((r) => r.data),
}

export const adminApi = {
  resumen: () => api.get<ResumenAdmin>('/api/admin/resumen').then((r) => r.data),
}
