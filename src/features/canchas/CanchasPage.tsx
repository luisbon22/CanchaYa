import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { canchasApi } from '../../api/endpoints'
import type { TipoCancha } from '../../api/types'
import { CanchaCard } from '../../components/CanchaCard'
import { Cargando, ErrorCarga, Vacio } from '../../components/Estados'
import { NOMBRE_TIPO } from '../../utils/format'

const filtros: (TipoCancha | undefined)[] = [undefined, 'FUTBOL_5', 'FUTBOL_8', 'FUTBOL_11']

export function CanchasPage() {
  const [tipo, setTipo] = useState<TipoCancha | undefined>()
  const canchas = useQuery({
    queryKey: ['canchas', { tipo }],
    queryFn: () => canchasApi.listar({ tipo, size: 50 }),
  })

  return (
    <div>
      <h1 className="text-3xl font-bold">Canchas</h1>
      <p className="mt-1 text-slate-600">Elige una cancha para ver sus horarios libres.</p>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
        {filtros.map((t) => (
          <button
            key={t ?? 'todas'}
            type="button"
            aria-pressed={tipo === t}
            onClick={() => setTipo(t)}
            className={`min-h-11 rounded-full px-4 py-2 font-medium transition ${
              tipo === t ? 'bg-cancha-700 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {t ? NOMBRE_TIPO[t] : 'Todas'}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {canchas.isPending ? (
          <Cargando texto="Buscando canchas…" />
        ) : canchas.isError ? (
          <ErrorCarga error={canchas.error} reintentar={() => canchas.refetch()} />
        ) : canchas.data.content.length === 0 ? (
          <Vacio titulo="No hay canchas de este tipo por ahora" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {canchas.data.content.map((c) => (
              <CanchaCard key={c.id} cancha={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
