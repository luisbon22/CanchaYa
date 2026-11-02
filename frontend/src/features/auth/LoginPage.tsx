import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { authApi } from '../../api/endpoints'
import { Button } from '../../components/Button'
import { Campo } from '../../components/Campo'
import { useAuth } from '../../hooks/useAuth'
import { mensajeDeError } from '../../utils/errors'

const esquema = z.object({
  email: z.email('Escribe un email válido'),
  password: z.string().min(1, 'Escribe tu contraseña'),
})

type Datos = z.infer<typeof esquema>

export function LoginPage() {
  const { iniciarSesion } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Datos>({ resolver: zodResolver(esquema) })

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (respuesta) => {
      iniciarSesion(respuesta)
      // SoloInvitados redirige al destino en cuanto hay sesión
      toast.success(`¡Hola, ${respuesta.nombre}!`)
    },
    onError: (error) => toast.error(mensajeDeError(error)),
  })

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-3xl font-bold">Ingresar</h1>
      <p className="mt-2 text-slate-600">Entra para reservar y ver tus partidos.</p>

      <form onSubmit={handleSubmit((datos) => login.mutate(datos))} className="mt-8 flex flex-col gap-4" noValidate>
        <Campo etiqueta="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Campo
          etiqueta="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" bloque cargando={login.isPending} className="mt-2">
          Ingresar
        </Button>
      </form>

      <p className="mt-6 text-center text-slate-600">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-cancha-800 underline">
          Regístrate
        </Link>
      </p>

      <div className="mt-8 rounded-2xl bg-cancha-50 p-4 text-sm text-cancha-900">
        <p className="font-semibold">Cuentas de prueba</p>
        <p className="mt-1">Cliente: cliente@canchaya.com · Cliente123*</p>
        <p>Admin: admin@canchaya.com · Admin123*</p>
      </div>
    </div>
  )
}
