import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { todayISO } from '../../lib/date'

export function useDashboard() {
  const fecha = todayISO()
  return useQuery({
    queryKey: ['admin-dashboard', fecha],
    queryFn: async () => {
      const [deliveries, disputes, insumos, deliveriesByRepartidor] = await Promise.all([
        supabase
          .from('deliveries')
          .select('monto_total, fecha_hora')
          .gte('fecha_hora', `${fecha}T00:00:00`)
          .lte('fecha_hora', `${fecha}T23:59:59`),
        supabase.from('dispatches').select('*, users!dispatches_repartidor_id_fkey(nombre)').eq('estado', 'en_disputa'),
        supabase.from('products').select('*').eq('tipo', 'insumo_interno'),
        supabase
          .from('deliveries')
          .select('repartidor_id, monto_total, users!deliveries_repartidor_id_fkey(nombre)')
          .gte('fecha_hora', `${fecha}T00:00:00`)
          .lte('fecha_hora', `${fecha}T23:59:59`),
      ])
      if (deliveries.error) throw deliveries.error
      if (disputes.error) throw disputes.error
      if (insumos.error) throw insumos.error
      if (deliveriesByRepartidor.error) throw deliveriesByRepartidor.error

      const ventasHoy = deliveries.data.reduce((sum, d) => sum + d.monto_total, 0)

      const porRepartidor = new Map<string, { nombre: string; total: number }>()
      for (const d of deliveriesByRepartidor.data as unknown as {
        repartidor_id: string
        monto_total: number
        users: { nombre: string } | null
      }[]) {
        const key = d.repartidor_id
        const prev = porRepartidor.get(key) ?? { nombre: d.users?.nombre ?? '—', total: 0 }
        prev.total += d.monto_total
        porRepartidor.set(key, prev)
      }
      const topRepartidor = [...porRepartidor.values()].sort((a, b) => b.total - a.total)[0]

      return {
        ventasHoy,
        disputasPendientes: disputes.data,
        panRallado: insumos.data.find((p) => p.nombre.toLowerCase().includes('rallado')),
        insumos: insumos.data,
        topRepartidor,
      }
    },
  })
}

export function useAdminClients() {
  return useQuery({
    queryKey: ['admin-clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*').order('nombre_negocio')
      if (error) throw error
      return data
    },
  })
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('nombre')
      if (error) throw error
      return data
    },
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*').order('nombre')
      if (error) throw error
      return data
    },
  })
}

export function useAdminTurnos() {
  return useQuery({
    queryKey: ['admin-turnos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('turnos_produccion').select('*').order('orden')
      if (error) throw error
      return data
    },
  })
}

export function useDisputes() {
  return useQuery({
    queryKey: ['admin-disputes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dispatches')
        .select('*, users!dispatches_repartidor_id_fkey(nombre), dispatch_items(*, products(nombre))')
        .eq('estado', 'en_disputa')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useInvalidateAdmin() {
  const queryClient = useQueryClient()
  return (key: string) => queryClient.invalidateQueries({ queryKey: [key] })
}
