import { Navigate, Outlet, useLocation } from 'react-router'
import type { Rol } from '../api/types'
import { useAuth } from '../hooks/useAuth'

export function inicioSegunRol(rol: Rol) {
  return rol === 'ADMIN' ? '/admin' : '/canchas'
}

/** Tras iniciar sesión el cliente vuelve a la página que intentaba abrir; el admin va a su panel. */
export function destinoTrasLogin(rol: Rol, desde?: string) {
  return rol === 'CLIENTE' && desde ? desde : inicioSegunRol(rol)
}

/** Exige sesión y, si se indica, un rol. Quien no tiene el rol vuelve a su página de inicio. */
export function RutaPrivada({ rol }: { rol?: Rol }) {
  const { usuario } = useAuth()
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }
  if (rol && usuario.rol !== rol) {
    return <Navigate to={inicioSegunRol(usuario.rol)} replace />
  }
  return <Outlet />
}

/** Login y registro no tienen sentido con una sesión abierta. */
export function SoloInvitados() {
  const { usuario } = useAuth()
  const location = useLocation()
  if (!usuario) return <Outlet />
  const desde = (location.state as { desde?: string } | null)?.desde
  return <Navigate to={destinoTrasLogin(usuario.rol, desde)} replace />
}
