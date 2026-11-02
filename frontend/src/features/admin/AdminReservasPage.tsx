import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { canchasApi, reservasApi } from '../../api/endpoints'
import type { EstadoReserva, Reserva } from '../../api/types'
import { Button } from '../../components/Button'
import { Campo, Selector } from '../../components/Campo'
import { EstadoBadge } from '../../components/EstadoBadge'
import { Cargando, ErrorCarga, Vacio } from '../../components/Estados'
import { NOMBRE_ESTADO, formatoCOP, formatoFechaCorta, horario } from '../../utils/format'
import { CancelarReservaModal } from '../reservas/CancelarReservaModal'

const TAMANO_PAGINA = 10

interface Filtros {
  fecha: string
  canchaId: string
  estado: '' | EstadoReserva
}

export function AdminReservasPage() {
  const [filtros, setFiltros] = useState<Filtros>({ fecha: '', canchaId: '', estado: '' })
  const [pagina, setPagina] = useState(0)
  const [aCancelar, setACancelar] = useState<Reserva | null>(null)

  const canchas = useQuery({
    queryKey: ['canchas', { admin: true }],
    queryFn: () => canchasApi.listar({ incluirInactivas: true, size: 100 }),
  })

  const reservas = useQuery({
    queryKey: ['reservas', filtros, pagina],
    queryFn: () =>
      reservasApi.listar({
        fecha: filtros.fecha || undefined,
        canchaId: filtros.canchaId ? Number(filtros.canchaId) : undefined,
        estado: filtros.estado || undefined,
        page: pagina,
        size: TAMANO_PAGINA,
      }),
    placeholderData: keepPreviousData,
  })

  const actualizar = <K extends keyof Filtros>(campo: K, valor: Filtros[K]) => {
    setFiltros((f) => ({ ...f, [campo]: valor }))
    setPagina(0)
  }

  const hayFiltros = filtros.fecha || filtros.canchaId || filtros.estado
  const datosPagina = reservas.data?.page

  return (
    <div>
      <h1 className="text-3xl font-bold">Reservas</h1>
      <p className="mt-1 text-slate-600">Consulta y cancela reservas de todas las canchas.</p>

      <div className="mt-6 grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:grid-cols-4 sm:items-end">
        <Campo etiqueta="Fecha" type="date" value={filtros.fecha} onChange={(e) => actualizar('fecha', e.target.value)} />
        <Selector etiqueta="Cancha" value={filtros.canchaId} onChange={(e) => actualizar('canchaId', e.target.value)}>
          <option value="">Todas</option>
          {canchas.data?.content.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Selector>
        <Selector
          etiqueta="Estado"
          value={filtros.estado}
          onChange={(e) => actualizar('estado', e.target.value as Filtros['estado'])}
        >
          <option value="">Todos</option>
          {Object.entries(NOMBRE_ESTADO).map(([valor, texto]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </Selector>
        <Button
          variante="secundario"
          disabled={!hayFiltros}
          onClick={() => {
            setFiltros({ fecha: '', canchaId: '', estado: '' })
            setPagina(0)
          }}
        >
          Limpiar filtros
        </Button>
      </div>

      <div className="mt-6">
        {reservas.isPending ? (
          <Cargando />
        ) : reservas.isError ? (
          <ErrorCarga error={reservas.error} reintentar={() => reservas.refetch()} />
        ) : reservas.data.content.length === 0 ? (
          <Vacio titulo="No hay reservas con estos filtros" />
        ) : (
          <div className={`overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 ${reservas.isFetching ? 'opacity-60' : ''}`}>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Reserva</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Cliente</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Valor</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reservas.data.content.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{r.cancha}</p>
                      <p className="text-sm text-slate-600">
                        {formatoFechaCorta(r.fecha)} · {horario(r.horaInicio, r.horaFin)}
                      </p>
                      <p className="text-sm text-slate-500 md:hidden">{r.usuario}</p>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">{r.usuario}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">{formatoCOP(r.precioTotal)}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={r.estado} />
                    </td>
                    <td className="px-2 py-3 text-right">
                      {r.estado === 'CONFIRMADA' && (
                        <Button variante="fantasma" className="text-red-700 hover:bg-red-50" onClick={() => setACancelar(r)}>
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {datosPagina && datosPagina.totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-between gap-4" aria-label="Paginación">
          <Button variante="secundario" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>
            ← Anterior
          </Button>
          <span className="text-sm text-slate-600">
            Página {datosPagina.number + 1} de {datosPagina.totalPages}
          </span>
          <Button
            variante="secundario"
            disabled={pagina + 1 >= datosPagina.totalPages}
            onClick={() => setPagina((p) => p + 1)}
          >
            Siguiente →
          </Button>
        </nav>
      )}

      <CancelarReservaModal reserva={aCancelar} onCerrar={() => setACancelar(null)} />
    </div>
  )
}
