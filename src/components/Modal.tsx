import { useEffect, useId, useRef, type ReactNode } from 'react'

interface ModalProps {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  acciones?: ReactNode
}

/** Diálogo accesible: cierra con Escape o tocando el fondo y devuelve el foco al cerrar. */
export function Modal({ abierto, titulo, onCerrar, children, acciones }: ModalProps) {
  const tituloId = useId()
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const anterior = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alPresionar)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alPresionar)
      document.body.style.overflow = ''
      anterior?.focus()
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onCerrar} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl outline-none sm:max-w-md sm:rounded-3xl"
      >
        <h2 id={tituloId} className="mb-4 text-xl font-bold text-slate-900">
          {titulo}
        </h2>
        {children}
        {acciones && <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{acciones}</div>}
      </div>
    </div>
  )
}
