import { useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { reservasApi } from '../../api/endpoints'
import type { Reserva } from '../../api/types'
import { Button } from '../../components/Button'
import { EstadoBadge } from '../../components/EstadoBadge'
import { Cargando, ErrorCarga, Vacio } from '../../components/Estados'
import { formatoCOP, formatoFechaLarga, horario, puedeCancelar, yaTermino } from '../../utils/format'
import { CancelarReservaModal } from './CancelarReservaModal'

type Pestana = 'proximas' | 'historial'

function TarjetaReserva({ reserva, onCancelar }: { reserva: Reserva; onCancelar: (r: Reserva) => void }) {
  const cancelable = puedeCancelar(reserva)
  return (
    <li className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold">{reserva.cancha}</h3>
          <EstadoBadge estado={reserva.estado} />
        </div>
        <p className="mt-1 text-slate-700">{formatoFechaLarga(reserva.fecha)}</p>
        <p className="text-slate-600">
          {horario(reserva.horaInicio, reserva.horaFin)} · {formatoCOP(reserva.precioTotal)}
        </p>
      </div>
      {cancelable ? (
        <Button variante="secundario" onClick={() => onCancelar(reserva)}>
          Cancelar
        </Button>
      ) : (
        reserva.estado === 'CONFIRMADA' && (
          <p className="text-sm text-slate-500 sm:max-w-48 sm:text-right">
            Faltan menos de 24 horas, ya no se puede cancelar.
          </p>
        )
      )}
    </li>
  )
}

export function MisReservasPage() {
  const [pestana, setPestana] = useState<Pestana>('proximas')
  const [aCancelar, setACancelar] = useState<Reserva | null>(null)
  const reservas = useQuery({
    queryKey: ['mis-reservas'],
    queryFn: () => reservasApi.misReservas({ size: 100 }),
  })

  const todas = reservas.data?.content ?? []
  const proximas = todas
    .filter((r) => r.estado === 'CONFIRMADA' && !yaTermino(r))
    .sort((a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio))
  const historial = todas.filter((r) => !proximas.includes(r))
  const lista = pestana === 'proximas' ? proximas : historial

  const pestanas: [Pestana, string, number][] = [
    ['proximas', 'Próximas', proximas.length],
    ['historial', 'Historial', historial.length],
  ]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mis reservas</h1>
          <p className="mt-1 text-slate-600">Tus partidos programados y anteriores.</p>
        </div>
        <Link to="/canchas" className="rounded-xl bg-cancha-700 px-4 py-2.5 font-semibold text-white hover:bg-cancha-800">
          Nueva reserva
        </Link>
      </div>

      <div className="mt-6 flex gap-2 border-b border-slate-200" role="tablist" aria-label="Tipo de reservas">
        {pestanas.map(([id, texto, cantidad]) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={pestana === id}
            aria-controls="panel-reservas"
            onClick={() => setPestana(id)}
            className={`-mb-px min-h-11 border-b-2 px-4 py-2 font-semibold ${
              pestana === id ? 'border-cancha-700 text-cancha-800' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {texto} {reservas.isSuccess && <span className="text-sm font-normal">({cantidad})</span>}
          </button>
        ))}
      </div>

      <div id="panel-reservas" role="tabpanel" aria-labelledby={`tab-${pestana}`} className="mt-6">
        {reservas.isPending ? (
          <Cargando texto="Cargando tus reservas…" />
        ) : reservas.isError ? (
          <ErrorCarga error={reservas.error} reintentar={() => reservas.refetch()} />
        ) : lista.length === 0 ? (
          <Vacio titulo={pestana === 'proximas' ? 'No tienes partidos próximos' : 'Aún no tienes historial'}>
            {pestana === 'proximas' && (
              <Link to="/canchas" className="font-semibold text-cancha-800 underline">
                Reserva tu primera cancha
              </Link>
            )}
          </Vacio>
        ) : (
          <ul className="flex flex-col gap-3">
            {lista.map((r) => (
              <TarjetaReserva key={r.id} reserva={r} onCancelar={setACancelar} />
            ))}
          </ul>
        )}
      </div>

      <CancelarReservaModal reserva={aCancelar} onCerrar={() => setACancelar(null)} />
    </div>
  )
}
