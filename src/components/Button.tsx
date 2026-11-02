import type { ButtonHTMLAttributes } from 'react'
import { Spinner } from './Spinner'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'

const estilos: Record<Variante, string> = {
  primario: 'bg-cancha-700 text-white hover:bg-cancha-800 disabled:bg-cancha-700/50',
  secundario: 'bg-white text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50 disabled:text-slate-400',
  peligro: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50',
  fantasma: 'text-cancha-800 hover:bg-cancha-50 disabled:text-slate-400',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  cargando?: boolean
  bloque?: boolean
}

export function Button({
  variante = 'primario',
  cargando = false,
  bloque = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold transition-colors disabled:cursor-not-allowed ${estilos[variante]} ${bloque ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {cargando && <Spinner className="size-4" />}
      {children}
    </button>
  )
}
