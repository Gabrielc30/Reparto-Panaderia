import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { fetchWithCache } from '../../lib/offlineFetch'
import { useAuth } from '../../auth/AuthContext'
import { todayISO } from '../../lib/date'

export function useProducts() {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['products', profile?.panaderia_id],
    enabled: !!profile,
    queryFn: () =>
      fetchWithCache(`products:${profile!.panaderia_id}`, async () => {
        const { data, error } = await supabase.from('products').select('*').order('nombre')
        if (error) throw error
        return data
      }),
  })
}

export function useRepartidores() {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['repartidores', profile?.panaderia_id],
    enabled: !!profile,
    queryFn: () =>
      fetchWithCache(`repartidores:${profile!.panaderia_id}`, async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('rol', 'repartidor')
          .eq('estado', 'activo')
          .order('nombre')
        if (error) throw error
        return data
      }),
  })
}

export function useHistorialPanadero() {
  const { profile } = useAuth()
  const fecha = todayISO()

  return useQuery({
    queryKey: ['historial-panadero', profile?.id, fecha],
    enabled: !!profile,
    queryFn: async () => {
      const [dispatches, localDispatches, conversions] = await Promise.all([
        supabase
          .from('dispatches')
          .select('*, users!dispatches_repartidor_id_fkey(nombre), dispatch_items(*, products(nombre))')
          .eq('panadero_id', profile!.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('local_dispatches')
          .select('*, products(nombre)')
          .eq('panadero_id', profile!.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('stock_conversions')
          .select('*')
          .eq('responsable_id', profile!.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ])
      if (dispatches.error) throw dispatches.error
      if (localDispatches.error) throw localDispatches.error
      if (conversions.error) throw conversions.error
      return {
        dispatches: dispatches.data,
        localDispatches: localDispatches.data,
        conversions: conversions.data,
      }
    },
  })
}
