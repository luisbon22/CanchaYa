import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// El token vive en memoria; AuthProvider lo sincroniza con localStorage.
let token: string | null = null
let alExpirarSesion: (() => void) | null = null

export function setToken(nuevo: string | null) {
  token = nuevo
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  alExpirarSesion = handler
}

api.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Un 401 en login significa credenciales incorrectas, no sesión vencida
    const esAuth = error.config?.url?.startsWith('/api/auth/')
    if (axios.isAxiosError(error) && error.response?.status === 401 && !esAuth) {
      alExpirarSesion?.()
    }
    return Promise.reject(error)
  },
)
