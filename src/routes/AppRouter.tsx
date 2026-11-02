import { createBrowserRouter, Link, RouterProvider } from 'react-router'
import { AuthProvider } from '../features/auth/AuthContext'
import { Layout } from '../components/Layout'
import { RutaPrivada, SoloInvitados } from './guards'
import { HomePage } from '../features/home/HomePage'
import { LoginPage } from '../features/auth/LoginPage'
import { RegistroPage } from '../features/auth/RegistroPage'
import { CanchasPage } from '../features/canchas/CanchasPage'
import { ReservarPage } from '../features/canchas/ReservarPage'
import { MisReservasPage } from '../features/reservas/MisReservasPage'

function NoEncontrada() {
  return (
    <div className="py-16 text-center">
      <p className="text-5xl font-bold text-cancha-700">404</p>
      <p className="mt-2 text-slate-600">Esta página no existe.</p>
      <Link to="/" className="mt-6 inline-block font-semibold text-cancha-800 underline">
        Volver al inicio
      </Link>
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Layout />
      </AuthProvider>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      {
        element: <SoloInvitados />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/registro', element: <RegistroPage /> },
        ],
      },
      {
        element: <RutaPrivada rol="CLIENTE" />,
        children: [
          { path: '/canchas', element: <CanchasPage /> },
          { path: '/canchas/:id', element: <ReservarPage /> },
          { path: '/mis-reservas', element: <MisReservasPage /> },
        ],
      },
      {
        // El panel de administración se descarga solo cuando un admin lo abre
        element: <RutaPrivada rol="ADMIN" />,
        children: [
          {
            path: '/admin',
            lazy: () => import('../features/admin/AdminResumenPage').then((m) => ({ Component: m.AdminResumenPage })),
          },
          {
            path: '/admin/canchas',
            lazy: () => import('../features/admin/AdminCanchasPage').then((m) => ({ Component: m.AdminCanchasPage })),
          },
          {
            path: '/admin/reservas',
            lazy: () => import('../features/admin/AdminReservasPage').then((m) => ({ Component: m.AdminReservasPage })),
          },
        ],
      },
      { path: '*', element: <NoEncontrada /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
