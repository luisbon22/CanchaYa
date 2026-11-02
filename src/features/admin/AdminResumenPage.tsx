import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { adminApi, reservasApi } from '../../api/endpoints'
import { EstadoBadge } from '../../components/EstadoBadge'
import { Cargando, ErrorCarga, Vacio } from '../../components/Estados'
import { formatoCOP, formatoFechaLarga, horario, hoyISO } from '../../utils/format'

function Indicador({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <p className="text-sm font-medium text-slate-600">{titulo}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{valor}</p>
    </div>
  )
}

export function AdminResumenPage() {
  const hoy = hoyISO()
  const resumen = useQuery({ queryKey: ['resumen'], queryFn: adminApi.resumen })
  const reservasHoy = useQuery({
    queryKey: ['reservas', { fecha: hoy, sort: 'horaInicio' }],
    queryFn: () => reservasApi.listar({ fecha: hoy, size: 100 }),
  })

  return (
    <div>
      <h1 className="text-3xl font-bold">Resumen del día</h1>
      <p className="mt-1 text-slate-600">{formatoFechaLarga(hoy)}</p>

      <div className="mt-6">
        {resumen.isPending ? (
          <Cargando />
        ) : resumen.isError ? (
          <ErrorCarga error={resumen.error} reintentar={() => resumen.refetch()} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Indicador titulo="Reservas de hoy" valor={String(resumen.data.reservasHoy)} />
            <Indicador titulo="Canchas activas" valor={String(resumen.data.canchasActivas)} />
            <Indicador titulo="Ingresos del día" valor={formatoCOP(resumen.data.ingresosHoy)} />
          </div>
        )}
      </div>

      <section className="mt-10" aria-labelledby="titulo-hoy">
        <div className="flex items-center justify-between gap-4">
          <h2 id="titulo-hoy" className="text-xl font-bold">
            Partidos de hoy
          </h2>
          <Link to="/admin/reservas" className="text-sm font-semibold text-cancha-800 underline">
            Ver todas las reservas
          </Link>
        </div>
        <div className="mt-4">
          {reservasHoy.isPending ? (
            <Cargando />
          ) : reservasHoy.isError ? (
            <ErrorCarga error={reservasHoy.error} reintentar={() => reservasHoy.refetch()} />
          ) : reservasHoy.data.content.length === 0 ? (
            <Vacio titulo="No hay reservas para hoy" />
          ) : (
            <ul className="divide-y divide-slate-200 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
              {[...reservasHoy.data.content]
                .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                .map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <div>
                      <p className="font-semibold">
                        {horario(r.horaInicio, r.horaFin)} · {r.cancha}
                      </p>
                      <p className="text-sm text-slate-600">
                        {r.usuario} · {formatoCOP(r.precioTotal)}
                      </p>
                    </div>
                    <EstadoBadge estado={r.estado} />
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
