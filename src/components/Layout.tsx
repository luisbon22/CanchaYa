import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-cancha-800">
      <img src="/favicon.svg" alt="" className="size-8" />
      CanchaYa
    </Link>
  )
}

export function Layout() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [rutaMenu, setRutaMenu] = useState(pathname)

  // Cierra el menú móvil al cambiar de página
  if (rutaMenu !== pathname) {
    setRutaMenu(pathname)
    setMenuAbierto(false)
  }

  const enlaces =
    usuario?.rol === 'ADMIN'
      ? [
          { a: '/admin', texto: 'Resumen', fin: true },
          { a: '/admin/canchas', texto: 'Canchas' },
          { a: '/admin/reservas', texto: 'Reservas' },
        ]
      : usuario
        ? [
            { a: '/canchas', texto: 'Canchas' },
            { a: '/mis-reservas', texto: 'Mis reservas' },
          ]
        : []

  const salir = () => {
    cerrarSesion()
    navigate('/')
  }

  const claseEnlace = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 font-medium ${isActive ? 'bg-cancha-50 text-cancha-800' : 'text-slate-700 hover:bg-slate-100'}`

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {enlaces.map((e) => (
              <NavLink key={e.a} to={e.a} end={e.fin} className={claseEnlace}>
                {e.texto}
              </NavLink>
            ))}
            {usuario ? (
              <button onClick={salir} className="ml-2 rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100">
                Salir
              </button>
            ) : (
              <>
                <NavLink to="/login" className={claseEnlace}>
                  Ingresar
                </NavLink>
                <Link to="/registro" className="ml-1 rounded-xl bg-cancha-700 px-4 py-2 font-semibold text-white hover:bg-cancha-800">
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
          <button
            className="inline-flex size-11 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 md:hidden"
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {menuAbierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
        {menuAbierto && (
          <nav id="menu-movil" className="border-t border-slate-200 px-4 py-3 md:hidden" aria-label="Principal">
            {usuario && <p className="px-3 pb-2 text-sm text-slate-500">Hola, {usuario.nombre}</p>}
            {enlaces.map((e) => (
              <NavLink key={e.a} to={e.a} end={e.fin} className={claseEnlace}>
                {e.texto}
              </NavLink>
            ))}
            {usuario ? (
              <button onClick={salir} className="block w-full rounded-lg px-3 py-2 text-left font-medium text-slate-700 hover:bg-slate-100">
                Salir
              </button>
            ) : (
              <>
                <NavLink to="/login" className={claseEnlace}>
                  Ingresar
                </NavLink>
                <NavLink to="/registro" className={claseEnlace}>
                  Crear cuenta
                </NavLink>
              </>
            )}
          </nav>
        )}
      </header>
      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-10">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        CanchaYa · Reserva tu cancha en pocos pasos
      </footer>
    </div>
  )
}
