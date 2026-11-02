import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { canchasApi } from '../../api/endpoints'
import type { Cancha } from '../../api/types'
import { Button } from '../../components/Button'
import { Cargando, ErrorCarga, Vacio } from '../../components/Estados'
import { Interruptor } from '../../components/Interruptor'
import { mensajeDeError } from '../../utils/errors'
import { NOMBRE_TIPO, formatoCOP, horario } from '../../utils/format'
import { CanchaFormModal } from './CanchaFormModal'

export function AdminCanchasPage() {
  const queryClient = useQueryClient()
  const [formulario, setFormulario] = useState<{ abierto: boolean; cancha: Cancha | null }>({
    abierto: false,
    cancha: null,
  })

  const canchas = useQuery({
    queryKey: ['canchas', { admin: true }],
    queryFn: () => canchasApi.listar({ incluirInactivas: true, size: 100 }),
  })

  const cambiarEstado = useMutation({
    mutationFn: ({ id, activa }: { id: number; activa: boolean }) => canchasApi.cambiarEstado(id, activa),
    onSuccess: (cancha) => {
      toast.success(`${cancha.nombre} ${cancha.activa ? 'activada' : 'desactivada'}`)
      queryClient.invalidateQueries({ queryKey: ['canchas'] })
      queryClient.invalidateQueries({ queryKey: ['resumen'] })
    },
    onError: (error) => toast.error(mensajeDeError(error)),
  })

  const abrir = (cancha: Cancha | null) => setFormulario({ abierto: true, cancha })
  const cerrar = () => setFormulario((f) => ({ ...f, abierto: false }))

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Canchas</h1>
          <p className="mt-1 text-slate-600">Crea, edita y activa o desactiva canchas.</p>
        </div>
        <Button onClick={() => abrir(null)}>+ Nueva cancha</Button>
      </div>

      <div className="mt-6">
        {canchas.isPending ? (
          <Cargando />
        ) : canchas.isError ? (
          <ErrorCarga error={canchas.error} reintentar={() => canchas.refetch()} />
        ) : canchas.data.content.length === 0 ? (
          <Vacio titulo="Todavía no hay canchas" />
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Cancha</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Precio / hora</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Horario</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Activa</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {canchas.data.content.map((c) => (
                  <tr key={c.id} className={c.activa ? '' : 'bg-slate-50 text-slate-500'}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{c.nombre}</p>
                      <p className="text-sm text-slate-500">
                        {NOMBRE_TIPO[c.tipo]}
                        <span className="sm:hidden"> · {formatoCOP(c.precioPorHora)}</span>
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">{formatoCOP(c.precioPorHora)}</td>
                    <td className="hidden px-4 py-3 md:table-cell">{horario(c.horaApertura, c.horaCierre)}</td>
                    <td className="px-4 py-3">
                      <Interruptor
                        activo={c.activa}
                        etiqueta={`${c.activa ? 'Desactivar' : 'Activar'} ${c.nombre}`}
                        deshabilitado={cambiarEstado.isPending && cambiarEstado.variables?.id === c.id}
                        onCambiar={(activa) => cambiarEstado.mutate({ id: c.id, activa })}
                      />
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Button variante="fantasma" onClick={() => abrir(c)} aria-label={`Editar ${c.nombre}`}>
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CanchaFormModal abierto={formulario.abierto} cancha={formulario.cancha} onCerrar={cerrar} />
    </div>
  )
}
