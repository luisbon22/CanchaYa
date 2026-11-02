import { Link } from 'react-router'
import type { Cancha } from '../api/types'
import { NOMBRE_TIPO, formatoCOP, horario } from '../utils/format'

export function CanchaCard({ cancha }: { cancha: Cancha }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="relative h-24 bg-gradient-to-br from-cancha-600 to-cancha-800">
        {/* Líneas de cancha decorativas */}
        <div className="absolute inset-3 rounded-lg border-2 border-white/30" aria-hidden="true" />
        <div className="absolute inset-y-3 left-1/2 border-l-2 border-white/30" aria-hidden="true" />
        <div
          className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30"
          aria-hidden="true"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-cancha-800">
          {NOMBRE_TIPO[cancha.tipo]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{cancha.nombre}</h3>
          <p className="text-sm text-slate-600">Abierta de {horario(cancha.horaApertura, cancha.horaCierre)}</p>
        </div>
        <p className="text-slate-900">
          <span className="text-xl font-bold">{formatoCOP(cancha.precioPorHora)}</span>
          <span className="text-sm text-slate-600"> / hora</span>
        </p>
        <Link
          to={`/canchas/${cancha.id}`}
          className="mt-auto inline-flex min-h-11 items-center justify-center rounded-xl bg-cancha-700 px-4 py-2.5 font-semibold text-white hover:bg-cancha-800"
        >
          Ver disponibilidad
        </Link>
      </div>
    </article>
  )
}
