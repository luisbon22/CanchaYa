import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { canchasApi, reservasApi } from '../../api/endpoints'
import type { Franja, Reserva } from '../../api/types'
import { Button } from '../../components/Button'
import { Cargando, ErrorCarga, Vacio } from '../../components/Estados'
import { Modal } from '../../components/Modal'
import { LeyendaFranjas, SlotPicker, type Seleccion } from '../../components/SlotPicker'
import { useDisponibilidad } from '../../hooks/useDisponibilidad'
import { estadoHttp, mensajeDeError } from '../../utils/errors'
import { NOMBRE_TIPO, fechaISO, formatoCOP, formatoFechaLarga, horario, hoyISO } from '../../utils/format'

const MAXIMO_HORAS = 3
const DIAS_VISIBLES = 14

function proximosDias(): Date[] {
  const hoy = new Date()
  return Array.from({ length: DIAS_VISIBLES }, (_, i) => new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i))
}

/** Siguiente selección tras tocar una franja: primero el inicio, luego el fin (hasta 3 horas seguidas libres). */
function siguienteSeleccion(actual: Seleccion | null, i: number, franjas: Franja[]): Seleccion | null {
  if (!actual || actual.inicio !== actual.fin || i < actual.inicio) {
    return { inicio: i, fin: i }
  }
  if (i === actual.inicio) return null
  const continuas = franjas.slice(actual.inicio, i + 1).every((f) => f.estado === 'LIBRE')
  if (!continuas) return { inicio: i, fin: i }
  if (i - actual.inicio + 1 > MAXIMO_HORAS) {
    toast.info(`Puedes reservar máximo ${MAXIMO_HORAS} horas seguidas.`)
    return actual
  }
  return { inicio: actual.inicio, fin: i }
}

export function ReservarPage() {
  const canchaId = Number(useParams().id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [fecha, setFecha] = useState(hoyISO())
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [creada, setCreada] = useState<Reserva | null>(null)

  const cancha = useQuery({ queryKey: ['cancha', canchaId], queryFn: () => canchasApi.obtener(canchaId) })
  const disponibilidad = useDisponibilidad(canchaId, fecha)
  const franjas = useMemo(() => disponibilidad.data?.franjas ?? [], [disponibilidad.data])
  const dias = useMemo(proximosDias, [])

  // Si al refrescar alguna franja seleccionada dejó de estar libre, se descarta la selección
  const seleccionValida =
    seleccion && franjas.slice(seleccion.inicio, seleccion.fin + 1).every((f) => f.estado === 'LIBRE')
      ? seleccion
      : null

  const horas = seleccionValida ? seleccionValida.fin - seleccionValida.inicio + 1 : 0
  const total = cancha.data ? horas * cancha.data.precioPorHora : 0
  const horaInicio = seleccionValida ? franjas[seleccionValida.inicio].horaInicio : ''
  const horaFin = seleccionValida ? franjas[seleccionValida.fin].horaFin : ''

  const reservar = useMutation({
    mutationFn: reservasApi.crear,
    onSuccess: (reserva) => {
      setConfirmando(false)
      setSeleccion(null)
      setCreada(reserva)
      queryClient.invalidateQueries({ queryKey: ['disponibilidad', canchaId] })
      queryClient.invalidateQueries({ queryKey: ['mis-reservas'] })
    },
    onError: (error) => {
      setConfirmando(false)
      toast.error(mensajeDeError(error, 'reserva'))
      if (estadoHttp(error) === 409) {
        setSeleccion(null)
        disponibilidad.refetch()
      }
    },
  })

  const cambiarFecha = (nueva: string) => {
    if (!nueva) return
    setFecha(nueva)
    setSeleccion(null)
  }

  if (cancha.isPending) return <Cargando />
  if (cancha.isError) return <ErrorCarga error={cancha.error} />

  return (
    <div className="pb-28">
      <Link to="/canchas" className="inline-flex items-center gap-1 text-sm font-medium text-cancha-800 hover:underline">
        ← Todas las canchas
      </Link>
      <h1 className="mt-3 text-3xl font-bold">{cancha.data.nombre}</h1>
      <p className="mt-1 text-slate-600">
        {NOMBRE_TIPO[cancha.data.tipo]} · {formatoCOP(cancha.data.precioPorHora)} por hora · Abierta de{' '}
        {horario(cancha.data.horaApertura, cancha.data.horaCierre)}
      </p>

      {!cancha.data.activa ? (
        <div className="mt-8">
          <Vacio titulo="Esta cancha no está recibiendo reservas por ahora" />
        </div>
      ) : (
        <>
          <section className="mt-8" aria-labelledby="titulo-fecha">
            <h2 id="titulo-fecha" className="text-lg font-bold">
              1. Elige el día
            </h2>
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2" role="group" aria-label="Próximos días">
              {dias.map((d) => {
                const iso = fechaISO(d)
                const activo = iso === fecha
                return (
                  <button
                    key={iso}
                    type="button"
                    aria-pressed={activo}
                    aria-label={formatoFechaLarga(iso)}
                    onClick={() => cambiarFecha(iso)}
                    className={`flex min-w-16 shrink-0 flex-col items-center rounded-2xl px-3 py-2 transition ${
                      activo ? 'bg-cancha-700 text-white shadow' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-medium uppercase">
                      {d.toLocaleDateString('es-CO', { weekday: 'short' })}
                    </span>
                    <span className="text-xl font-bold">{d.getDate()}</span>
                    <span className="text-xs">{d.toLocaleDateString('es-CO', { month: 'short' })}</span>
                  </button>
                )
              })}
            </div>
            <label className="mt-3 flex items-center gap-3 text-sm text-slate-600">
              Otra fecha:
              <input
                type="date"
                min={hoyISO()}
                value={fecha}
                onChange={(e) => cambiarFecha(e.target.value)}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-900"
              />
            </label>
          </section>

          <section className="mt-8" aria-labelledby="titulo-horas">
            <h2 id="titulo-horas" className="text-lg font-bold">
              2. Toca la hora de inicio y la de fin
            </h2>
            <p className="mt-1 text-sm text-slate-600">{formatoFechaLarga(fecha)}</p>
            <div className="mt-3">
              <LeyendaFranjas />
            </div>
            <div className="mt-4">
              {disponibilidad.isPending ? (
                <Cargando texto="Consultando horarios…" />
              ) : disponibilidad.isError ? (
                <ErrorCarga error={disponibilidad.error} reintentar={() => disponibilidad.refetch()} />
              ) : franjas.every((f) => f.estado !== 'LIBRE') ? (
                <Vacio titulo="No quedan horarios libres este día">
                  <p className="text-sm text-slate-600">Prueba con otra fecha.</p>
                </Vacio>
              ) : (
                <SlotPicker
                  franjas={franjas}
                  seleccion={seleccionValida}
                  onSeleccionar={(i) => setSeleccion(siguienteSeleccion(seleccionValida, i, franjas))}
                />
              )}
            </div>
          </section>
        </>
      )}

      {seleccionValida && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
            <div aria-live="polite">
              <p className="text-sm text-slate-600">
                {horario(horaInicio, horaFin)} · {horas} {horas === 1 ? 'hora' : 'horas'}
              </p>
              <p className="text-xl font-bold">{formatoCOP(total)}</p>
            </div>
            <Button onClick={() => setConfirmando(true)}>Confirmar reserva</Button>
          </div>
        </div>
      )}

      <Modal
        abierto={confirmando}
        titulo="¿Confirmas tu reserva?"
        onCerrar={() => !reservar.isPending && setConfirmando(false)}
        acciones={
          <>
            <Button variante="secundario" onClick={() => setConfirmando(false)} disabled={reservar.isPending}>
              Volver
            </Button>
            <Button
              cargando={reservar.isPending}
              onClick={() => reservar.mutate({ canchaId, fecha, horaInicio, horaFin })}
            >
              Sí, reservar
            </Button>
          </>
        }
      >
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="text-slate-500">Cancha</dt>
          <dd className="font-medium">{cancha.data.nombre}</dd>
          <dt className="text-slate-500">Fecha</dt>
          <dd className="font-medium">{formatoFechaLarga(fecha)}</dd>
          <dt className="text-slate-500">Horario</dt>
          <dd className="font-medium">{horario(horaInicio, horaFin)}</dd>
          <dt className="text-slate-500">Total</dt>
          <dd className="text-lg font-bold text-cancha-800">{formatoCOP(total)}</dd>
        </dl>
        <p className="mt-4 text-sm text-slate-500">Puedes cancelar gratis hasta 24 horas antes.</p>
      </Modal>

      <Modal
        abierto={creada !== null}
        titulo="¡Reserva confirmada!"
        onCerrar={() => setCreada(null)}
        acciones={
          <>
            <Button variante="secundario" onClick={() => setCreada(null)}>
              Reservar otra
            </Button>
            <Button onClick={() => navigate('/mis-reservas')}>Ver mis reservas</Button>
          </>
        }
      >
        {creada && (
          <div className="flex flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-cancha-100 text-3xl text-cancha-700" aria-hidden="true">
              ✓
            </span>
            <p className="mt-4 text-slate-700">
              {creada.cancha}, {formatoFechaLarga(creada.fecha).toLowerCase()} de{' '}
              {horario(creada.horaInicio, creada.horaFin)}.
            </p>
            <p className="mt-1 font-bold">{formatoCOP(creada.precioTotal)}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
