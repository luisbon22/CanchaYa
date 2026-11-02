import { Navigate, Outlet, useLocation } from 'react-router'
import type { Rol } from '../api/types'
import { useAuth } from '../hooks/useAuth'

export function inicioSegunRol(rol: Rol) {
  return rol === 'ADMIN' ? '/admin' : '/canchas'
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
  return usuario ? <Navigate to={inicioSegunRol(usuario.rol)} replace /> : <Outlet />
}
