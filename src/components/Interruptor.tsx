interface InterruptorProps {
  activo: boolean
  etiqueta: string
  onCambiar: (valor: boolean) => void
  deshabilitado?: boolean
}

export function Interruptor({ activo, etiqueta, onCambiar, deshabilitado }: InterruptorProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={deshabilitado}
      onClick={() => onCambiar(!activo)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        activo ? 'bg-cancha-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
          activo ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
