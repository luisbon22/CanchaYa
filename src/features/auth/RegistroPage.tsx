import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { authApi } from '../../api/endpoints'
import { Button } from '../../components/Button'
import { Campo } from '../../components/Campo'
import { useAuth } from '../../hooks/useAuth'
import { mensajeDeError } from '../../utils/errors'

const esquema = z
  .object({
    nombre: z.string().trim().min(2, 'Escribe tu nombre').max(100, 'Máximo 100 caracteres'),
    email: z.email('Escribe un email válido').max(150, 'Máximo 150 caracteres'),
    password: z.string().min(8, 'Mínimo 8 caracteres').max(72, 'Máximo 72 caracteres'),
    confirmacion: z.string(),
  })
  .refine((d) => d.password === d.confirmacion, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmacion'],
  })

type Datos = z.infer<typeof esquema>

export function RegistroPage() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Datos>({ resolver: zodResolver(esquema), mode: 'onTouched' })

  const registro = useMutation({
    mutationFn: authApi.registrar,
    onSuccess: (respuesta) => {
      iniciarSesion(respuesta)
      toast.success('¡Cuenta creada! Ya puedes reservar.')
      navigate('/canchas', { replace: true })
    },
    onError: (error) => toast.error(mensajeDeError(error)),
  })

  const enviar = ({ nombre, email, password }: Datos) => registro.mutate({ nombre, email, password })

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-3xl font-bold">Crear cuenta</h1>
      <p className="mt-2 text-slate-600">Regístrate gratis y reserva en segundos.</p>

      <form onSubmit={handleSubmit(enviar)} className="mt-8 flex flex-col gap-4" noValidate>
        <Campo etiqueta="Nombre" autoComplete="name" error={errors.nombre?.message} {...register('nombre')} />
        <Campo etiqueta="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Campo
          etiqueta="Contraseña"
          type="password"
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password', { deps: ['confirmacion'] })}
        />
        <Campo
          etiqueta="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmacion?.message}
          {...register('confirmacion')}
        />
        <Button type="submit" bloque cargando={registro.isPending} className="mt-2">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-cancha-800 underline">
          Ingresa
        </Link>
      </p>
    </div>
  )
}
