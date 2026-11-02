import type { ReactNode } from 'react'
import { Spinner } from './Spinner'
import { Button } from './Button'
import { mensajeDeError } from '../utils/errors'

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-16 text-cancha-700">
      <Spinner className="size-8" />
      <span className="text-sm text-slate-600">{texto}</span>
    </div>
  )
}

export function ErrorCarga({ error, reintentar }: { error: unknown; reintentar?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-2xl bg-red-50 px-6 py-10 text-center">
      <p className="text-red-800">{mensajeDeError(error)}</p>
      {reintentar && (
        <Button variante="secundario" onClick={reintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

export function Vacio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 px-6 py-12 text-center">
      <p className="font-semibold text-slate-700">{titulo}</p>
      {children}
    </div>
  )
}
