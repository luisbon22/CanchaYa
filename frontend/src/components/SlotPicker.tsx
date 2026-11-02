import type { Franja } from '../api/types'

export interface Seleccion {
  inicio: number
  fin: number
}

interface SlotPickerProps {
  franjas: Franja[]
  seleccion: Seleccion | null
  onSeleccionar: (indice: number) => void
}

const estilo = {
  libre: 'bg-cancha-50 text-cancha-800 ring-1 ring-cancha-200 hover:bg-cancha-100',
  seleccionada: 'bg-blue-600 text-white ring-2 ring-blue-600 shadow-md',
  noDisponible: 'bg-slate-100 text-slate-400 line-through cursor-not-allowed',
}

/** Franjas de una hora como botones: verde libre, gris ocupada o pasada, azul seleccionada. */
export function SlotPicker({ franjas, seleccion, onSeleccionar }: SlotPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6" role="group" aria-label="Horarios del día">
      {franjas.map((franja, i) => {
        const libre = franja.estado === 'LIBRE'
        const seleccionada = seleccion !== null && i >= seleccion.inicio && i <= seleccion.fin
        const clase = seleccionada ? estilo.seleccionada : libre ? estilo.libre : estilo.noDisponible
        const motivo = franja.estado === 'OCUPADA' ? 'ocupada' : franja.estado === 'PASADA' ? 'ya pasó' : 'libre'
        return (
          <button
            key={franja.horaInicio}
            type="button"
            disabled={!libre}
            aria-pressed={seleccionada}
            aria-label={`${franja.horaInicio} a ${franja.horaFin}, ${seleccionada ? 'seleccionada' : motivo}`}
            onClick={() => onSeleccionar(i)}
            className={`min-h-12 rounded-xl px-2 py-3 text-base font-semibold transition ${clase}`}
          >
            {franja.horaInicio}
          </button>
        )
      })}
    </div>
  )
}

export function LeyendaFranjas() {
  const items = [
    ['bg-cancha-50 ring-1 ring-cancha-200', 'Libre'],
    ['bg-blue-600', 'Seleccionada'],
    ['bg-slate-200', 'Ocupada o pasada'],
  ]
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
      {items.map(([color, texto]) => (
        <li key={texto} className="flex items-center gap-1.5">
          <span className={`inline-block size-3.5 rounded ${color}`} aria-hidden="true" />
          {texto}
        </li>
      ))}
    </ul>
  )
}
