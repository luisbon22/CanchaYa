import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { inicioSegunRol } from '../../routes/guards'

const tipos = [
  { nombre: 'Fútbol 5', detalle: 'Ideal para partidos rápidos entre amigos', jugadores: '10 jugadores' },
  { nombre: 'Fútbol 8', detalle: 'Más espacio, más juego en equipo', jugadores: '16 jugadores' },
  { nombre: 'Fútbol 11', detalle: 'Cancha reglamentaria para torneos', jugadores: '22 jugadores' },
]

const pasos = [
  ['Elige la cancha', 'Mira precios y horarios de todas las canchas.'],
  ['Escoge fecha y hora', 'Los horarios libres aparecen en verde.'],
  ['Confirma', 'Revisa el resumen y listo, tu cancha queda reservada.'],
]

export function HomePage() {
  const { usuario } = useAuth()
  const destino = usuario ? inicioSegunRol(usuario.rol) : '/canchas'

  return (
    <div className="flex flex-col gap-14">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cancha-700 to-cancha-900 px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="absolute -right-16 -top-16 size-64 rounded-full border-[6px] border-white/10" aria-hidden="true" />
        <div className="absolute -bottom-24 right-24 size-48 rounded-full border-[6px] border-white/10" aria-hidden="true" />
        <div className="relative max-w-xl">
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">Tu cancha lista en menos de un minuto</h1>
          <p className="mt-4 text-lg text-cancha-100">
            Consulta la disponibilidad en tiempo real, reserva por horas y gestiona tus partidos desde el celular.
          </p>
          <Link
            to={destino}
            className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-white px-6 py-3 text-lg font-bold text-cancha-800 shadow-lg hover:bg-cancha-50"
          >
            {usuario?.rol === 'ADMIN' ? 'Ir al panel' : 'Reservar ahora'}
          </Link>
        </div>
      </section>

      <section aria-labelledby="titulo-canchas">
        <h2 id="titulo-canchas" className="text-2xl font-bold">
          Canchas para cada partido
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {tipos.map((t) => (
            <Link
              key={t.nombre}
              to={destino}
              className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative mb-4 h-20 rounded-xl bg-gradient-to-br from-cancha-500 to-cancha-700">
                <div className="absolute inset-2 rounded-lg border-2 border-white/40" aria-hidden="true" />
                <div className="absolute inset-y-2 left-1/2 border-l-2 border-white/40" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold">{t.nombre}</h3>
              <p className="text-sm text-slate-600">{t.detalle}</p>
              <p className="mt-2 text-sm font-medium text-cancha-700">{t.jugadores}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="titulo-pasos">
        <h2 id="titulo-pasos" className="text-2xl font-bold">
          Así de fácil
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {pasos.map(([titulo, texto], i) => (
            <li key={titulo} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cancha-100 text-lg font-bold text-cancha-800">
                {i + 1}
              </span>
              <div>
                <h3 className="font-bold">{titulo}</h3>
                <p className="text-sm text-slate-600">{texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
