import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

const claseControl =
  'block w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:border-cancha-600 focus:outline-none focus:ring-2 focus:ring-cancha-600/30 aria-[invalid=true]:border-red-500'

interface EnvoltorioProps {
  id: string
  etiqueta: string
  error?: string
  ayuda?: string
  children: ReactNode
}

function Envoltorio({ id, etiqueta, error, ayuda, children }: EnvoltorioProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : (
        ayuda && <p className="text-sm text-slate-500">{ayuda}</p>
      )}
    </div>
  )
}

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  error?: string
  ayuda?: string
}

export const Campo = forwardRef<HTMLInputElement, CampoProps>(function Campo(
  { etiqueta, error, ayuda, id, ...props },
  ref,
) {
  const generado = useId()
  const campoId = id ?? generado
  return (
    <Envoltorio id={campoId} etiqueta={etiqueta} error={error} ayuda={ayuda}>
      <input
        ref={ref}
        id={campoId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${campoId}-error` : undefined}
        className={claseControl}
        {...props}
      />
    </Envoltorio>
  )
})

interface SelectorProps extends SelectHTMLAttributes<HTMLSelectElement> {
  etiqueta: string
  error?: string
}

export const Selector = forwardRef<HTMLSelectElement, SelectorProps>(function Selector(
  { etiqueta, error, id, children, ...props },
  ref,
) {
  const generado = useId()
  const campoId = id ?? generado
  return (
    <Envoltorio id={campoId} etiqueta={etiqueta} error={error}>
      <select
        ref={ref}
        id={campoId}
        aria-invalid={error ? true : undefined}
        className={claseControl}
        {...props}
      >
        {children}
      </select>
    </Envoltorio>
  )
})
