import { useContext } from 'react'
import { AuthContext } from '../features/auth/AuthContext'

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return contexto
}
