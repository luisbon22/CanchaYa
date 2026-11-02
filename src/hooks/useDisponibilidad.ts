import { useQuery } from '@tanstack/react-query'
import { canchasApi } from '../api/endpoints'

export function useDisponibilidad(canchaId: number, fecha: string) {
  return useQuery({
    queryKey: ['disponibilidad', canchaId, fecha],
    queryFn: () => canchasApi.disponibilidad(canchaId, fecha),
    enabled: Number.isFinite(canchaId) && fecha.length === 10,
    // Se refresca cada minuto para que las franjas tomadas por otros aparezcan solas
    refetchInterval: 60_000,
  })
}
