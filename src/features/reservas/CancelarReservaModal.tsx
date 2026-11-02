import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reservasApi } from '../../api/endpoints'
import type { Reserva } from '../../api/types'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { mensajeDeError } from '../../utils/errors'
import { formatoCOP, formatoFechaLarga, horario } from '../../utils/format'

interface Props {
  reserva: Reserva | null
  onCerrar: () => void
}

export function CancelarReservaModal({ reserva, onCerrar }: Props) {
  const queryClient = useQueryClient()
  const cancelar = useMutation({
    mutationFn: reservasApi.cancelar,
    onSuccess: () => {
      toast.success('Reserva cancelada')
      queryClient.invalidateQueries({ queryKey: ['mis-reservas'] })
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      queryClient.invalidateQueries({ queryKey: ['resumen'] })
      queryClient.invalidateQueries({ queryKey: ['disponibilidad'] })
      onCerrar()
    },
    onError: (error) => toast.error(mensajeDeError(error)),
  })

  return (
    <Modal
      abierto={reserva !== null}
      titulo="¿Cancelar esta reserva?"
      onCerrar={() => !cancelar.isPending && onCerrar()}
      acciones={
        <>
          <Button variante="secundario" onClick={onCerrar} disabled={cancelar.isPending}>
            No, mantenerla
          </Button>
          <Button variante="peligro" cargando={cancelar.isPending} onClick={() => reserva && cancelar.mutate(reserva.id)}>
            Sí, cancelar
          </Button>
        </>
      }
    >
      {reserva && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="text-slate-500">Cancha</dt>
          <dd className="font-medium">{reserva.cancha}</dd>
          <dt className="text-slate-500">Fecha</dt>
          <dd className="font-medium">{formatoFechaLarga(reserva.fecha)}</dd>
          <dt className="text-slate-500">Horario</dt>
          <dd className="font-medium">{horario(reserva.horaInicio, reserva.horaFin)}</dd>
          <dt className="text-slate-500">Valor</dt>
          <dd className="font-medium">{formatoCOP(reserva.precioTotal)}</dd>
        </dl>
      )}
      <p className="mt-4 text-sm text-slate-500">Esta acción no se puede deshacer.</p>
    </Modal>
  )
}
