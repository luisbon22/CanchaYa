import type { EstadoReserva } from '../api/types'
import { NOMBRE_ESTADO } from '../utils/format'

const colores: Record<EstadoReserva, string> = {
  CONFIRMADA: 'bg-cancha-100 text-cancha-800',
  CANCELADA: 'bg-red-100 text-red-800',
  COMPLETADA: 'bg-slate-200 text-slate-700',
}

export function EstadoBadge({ estado }: { estado: EstadoReserva }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colores[estado]}`}>
      {NOMBRE_ESTADO[estado]}
    </span>
  )
}
