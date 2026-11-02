import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { setToken, setUnauthorizedHandler } from '../../api/client'
import type { AuthResponse, Rol } from '../../api/types'

const CLAVE_SESION = 'canchaya.sesion'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
}

interface Sesion {
  token: string
  expiraEn: number
  usuario: Usuario
}

export interface AuthContextValue {
  usuario: Usuario | null
  iniciarSesion: (respuesta: AuthResponse) => void
  cerrarSesion: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function leerSesion(): Sesion | null {
  try {
    const guardada = localStorage.getItem(CLAVE_SESION)
    if (!guardada) return null
    const sesion = JSON.parse(guardada) as Sesion
    if (sesion.expiraEn <= Date.now()) {
      localStorage.removeItem(CLAVE_SESION)
      return null
    }
    return sesion
  } catch {
    return null
  }
}

function guardarSesion(sesion: Sesion | null) {
  try {
    if (sesion) localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
    else localStorage.removeItem(CLAVE_SESION)
  } catch {
    // Sin almacenamiento disponible la sesión dura lo que dure la pestaña
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [sesion, setSesion] = useState<Sesion | null>(() => {
    const inicial = leerSesion()
    setToken(inicial?.token ?? null)
    return inicial
  })

  const iniciarSesion = useCallback((r: AuthResponse) => {
    const nueva: Sesion = {
      token: r.token,
      expiraEn: Date.now() + r.expiraEnMs,
      usuario: { id: r.usuarioId, nombre: r.nombre, email: r.email, rol: r.rol },
    }
    setToken(nueva.token)
    guardarSesion(nueva)
    setSesion(nueva)
  }, [])

  const cerrarSesion = useCallback(() => {
    setToken(null)
    guardarSesion(null)
    setSesion(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      cerrarSesion()
      // Varias peticiones pueden fallar a la vez: el id evita avisos repetidos
      toast.error('Tu sesión expiró. Vuelve a iniciar sesión.', { id: 'sesion-expirada' })
      navigate('/login', { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [cerrarSesion, navigate])

  const value = useMemo(
    () => ({ usuario: sesion?.usuario ?? null, iniciarSesion, cerrarSesion }),
    [sesion, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
