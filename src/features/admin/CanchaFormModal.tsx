import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { canchasApi } from '../../api/endpoints'
import type { Cancha } from '../../api/types'
import { Button } from '../../components/Button'
import { Campo, Selector } from '../../components/Campo'
import { Modal } from '../../components/Modal'
import { mensajeDeError } from '../../utils/errors'
import { NOMBRE_TIPO } from '../../utils/format'

const horaEnPunto = z.string().regex(/^\d{2}:00$/, 'Usa una hora en punto, por ejemplo 08:00')

const esquema = z
  .object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
    tipo: z.enum(['FUTBOL_5', 'FUTBOL_8', 'FUTBOL_11']),
    precioPorHora: z.number({ error: 'Escribe el precio' }).positive('El precio debe ser mayor a 0'),
    horaApertura: horaEnPunto,
    horaCierre: horaEnPunto,
  })
  .refine((d) => d.horaCierre > d.horaApertura, {
    message: 'El cierre debe ser después de la apertura',
    path: ['horaCierre'],
  })

type Datos = z.infer<typeof esquema>

const vacio: Datos = { nombre: '', tipo: 'FUTBOL_5', precioPorHora: 80000, horaApertura: '08:00', horaCierre: '22:00' }

interface Props {
  abierto: boolean
  cancha: Cancha | null
  onCerrar: () => void
}

/** Crea una cancha nueva o edita la recibida. */
export function CanchaFormModal({ abierto, cancha, onCerrar }: Props) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Datos>({ resolver: zodResolver(esquema), mode: 'onTouched' })

  useEffect(() => {
    if (abierto) {
      reset(cancha ? { ...cancha } : vacio)
    }
  }, [abierto, cancha, reset])

  const guardar = useMutation({
    mutationFn: (datos: Datos) => (cancha ? canchasApi.actualizar(cancha.id, datos) : canchasApi.crear(datos)),
    onSuccess: () => {
      toast.success(cancha ? 'Cancha actualizada' : 'Cancha creada')
      queryClient.invalidateQueries({ queryKey: ['canchas'] })
      queryClient.invalidateQueries({ queryKey: ['resumen'] })
      onCerrar()
    },
    onError: (error) => toast.error(mensajeDeError(error)),
  })

  return (
    <Modal abierto={abierto} titulo={cancha ? 'Editar cancha' : 'Nueva cancha'} onCerrar={onCerrar}>
      <form onSubmit={handleSubmit((d) => guardar.mutate(d))} className="flex flex-col gap-4" noValidate>
        <Campo etiqueta="Nombre" error={errors.nombre?.message} {...register('nombre')} />
        <Selector etiqueta="Tipo" error={errors.tipo?.message} {...register('tipo')}>
          {Object.entries(NOMBRE_TIPO).map(([valor, texto]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </Selector>
        <Campo
          etiqueta="Precio por hora (COP)"
          type="number"
          inputMode="numeric"
          min={1}
          step={1000}
          error={errors.precioPorHora?.message}
          {...register('precioPorHora', { valueAsNumber: true })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Campo
            etiqueta="Apertura"
            type="time"
            step={3600}
            error={errors.horaApertura?.message}
            {...register('horaApertura')}
          />
          <Campo etiqueta="Cierre" type="time" step={3600} error={errors.horaCierre?.message} {...register('horaCierre')} />
        </div>
        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variante="secundario" onClick={onCerrar} disabled={guardar.isPending}>
            Cancelar
          </Button>
          <Button type="submit" cargando={guardar.isPending}>
            {cancha ? 'Guardar cambios' : 'Crear cancha'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
