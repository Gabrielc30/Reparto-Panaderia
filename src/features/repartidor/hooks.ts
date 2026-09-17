import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { fetchWithCache } from '../../lib/offlineFetch'
import { todayISO } from '../../lib/date'
import { useAuth } from '../../auth/AuthContext'
import type { DispatchWithItems } from '../../types/domain'

export function useTodayDispatches() {
  const { profile } = useAuth()
  const fecha = todayISO()

  return useQuery({
    queryKey: ['dispatches', 'today', profile?.id],
    enabled: !!profile,
    queryFn: () =>
      fetchWithCache<DispatchWithItems[]>(`dispatches:${profile!.id}:${fecha}`, async () => {
        const { data, error } = await supabase
          .from('dispatches')
          .select('*, dispatch_items(*, products(*))')
          .eq('repartidor_id', profile!.id)
          .eq('fecha', fecha)
          .order('created_at', { ascending: true })
        if (error) throw error
        return data as unknown as DispatchWithItems[]
      }),
  })
}

export function useClients() {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['clients', profile?.panaderia_id],
    enabled: !!profile,
    queryFn: () =>
      fetchWithCache(`clients:${profile!.panaderia_id}`, async () => {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('nombre_negocio', { ascending: true })
        if (error) throw error
        return data
      }),
  })
}

export function useTodayDeliveries() {
  const { profile } = useAuth()
  const fecha = todayISO()

  return useQuery({
    queryKey: ['deliveries', 'today', profile?.id],
    enabled: !!profile,
    queryFn: () =>
      fetchWithCache(`deliveries:${profile!.id}:${fecha}`, async () => {
        const { data, error } = await supabase
          .from('deliveries')
          .select('*, clients(nombre_negocio), delivery_items(*, products(nombre))')
          .eq('repartidor_id', profile!.id)
          .gte('fecha_hora', `${fecha}T00:00:00`)
          .lte('fecha_hora', `${fecha}T23:59:59`)
          .order('fecha_hora', { ascending: false })
        if (error) throw error
        return data
      }),
  })
}

export function useCierreDia() {
  const { profile } = useAuth()
  const fecha = todayISO()

  return useQuery({
    queryKey: ['cierre_dia', profile?.id, fecha],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cierre_dia_repartidor')
        .select('*')
        .eq('repartidor_id', profile!.id)
        .eq('fecha', fecha)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}
