import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { Card } from '../../components/Card'
import { TextField } from '../../components/TextField'
import { CardSkeleton } from '../../components/Skeleton'
import { formatMoney } from '../../lib/date'

function useReportes(desde: string, hasta: string) {
  return useQuery({
    queryKey: ['reportes', desde, hasta],
    queryFn: async () => {
      const [deliveries, payments, conversions] = await Promise.all([
        supabase
          .from('deliveries')
          .select(
            '*, clients(nombre_negocio), users!deliveries_repartidor_id_fkey(nombre), delivery_items(*, products(nombre))',
          )
          .gte('fecha_hora', `${desde}T00:00:00`)
          .lte('fecha_hora', `${hasta}T23:59:59`),
        supabase
          .from('payments')
          .select('*, clients(nombre_negocio)')
          .gte('fecha', `${desde}T00:00:00`)
          .lte('fecha', `${hasta}T23:59:59`),
        supabase
          .from('stock_conversions')
          .select('*')
          .gte('fecha', desde)
          .lte('fecha', hasta),
      ])
      if (deliveries.error) throw deliveries.error
      if (payments.error) throw payments.error
      if (conversions.error) throw conversions.error
      return { deliveries: deliveries.data, payments: payments.data, conversions: conversions.data }
    },
  })
}

export function Reportes() {
  const today = new Date().toISOString().slice(0, 10)
  const [desde, setDesde] = useState(today)
  const [hasta, setHasta] = useState(today)
  const { data, isLoading } = useReportes(desde, hasta)

  const porRepartidor = new Map<string, number>()
  const porCliente = new Map<string, number>()
  let totalVentas = 0
  let totalCambios = 0

  for (const delivery of data?.deliveries ?? []) {
    const repartidorNombre =
      (delivery as { users?: { nombre: string } }).users?.nombre ?? '—'
    const clienteNombre =
      (delivery as { clients?: { nombre_negocio: string } }).clients?.nombre_negocio ?? '—'
    const items =
      (delivery as { delivery_items?: { tipo_movimiento: string; cantidad: number; precio_unitario: number | null }[] })
        .delivery_items ?? []
    for (const item of items) {
      if (item.tipo_movimiento === 'venta') {
        const monto = item.cantidad * (item.precio_unitario ?? 0)
        totalVentas += monto
        porRepartidor.set(repartidorNombre, (porRepartidor.get(repartidorNombre) ?? 0) + monto)
        porCliente.set(clienteNombre, (porCliente.get(clienteNombre) ?? 0) + monto)
      } else {
        totalCambios += item.cantidad
      }
    }
  }

  const totalCobrado = (data?.payments ?? []).reduce((sum, p) => sum + p.monto, 0)
  const totalPanRallado = (data?.conversions ?? []).reduce((sum, c) => sum + c.pan_rallado_obtenido_kg, 0)

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight text-brand-900">Reportes</h1>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <TextField label="Desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <TextField label="Hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <CardSkeleton rows={1} />
          <CardSkeleton rows={1} />
          <CardSkeleton rows={1} />
          <CardSkeleton rows={1} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <p className="text-sm text-brand-500">Ventas totales</p>
              <p className="text-xl font-bold text-brand-900">{formatMoney(totalVentas)}</p>
            </Card>
            <Card>
              <p className="text-sm text-brand-500">Cobros cta. corriente</p>
              <p className="text-xl font-bold text-brand-900">{formatMoney(totalCobrado)}</p>
            </Card>
            <Card>
              <p className="text-sm text-brand-500">Unidades cambiadas</p>
              <p className="text-xl font-bold text-brand-900">{totalCambios}</p>
            </Card>
            <Card>
              <p className="text-sm text-brand-500">Pan rallado producido</p>
              <p className="text-xl font-bold text-brand-900">{totalPanRallado} kg</p>
            </Card>
          </div>

          <Card>
            <p className="mb-3 font-semibold text-brand-900">Ventas por repartidor</p>
            <table className="w-full text-left text-sm">
              <tbody>
                {[...porRepartidor.entries()].map(([nombre, total]) => (
                  <tr key={nombre} className="border-b border-brand-100 last:border-0">
                    <td className="py-2 text-brand-900">{nombre}</td>
                    <td className="text-right">{formatMoney(total)}</td>
                  </tr>
                ))}
                {porRepartidor.size === 0 && (
                  <tr>
                    <td className="py-2 text-brand-500">Sin datos en el período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          <Card>
            <p className="mb-3 font-semibold text-brand-900">Ventas por cliente</p>
            <table className="w-full text-left text-sm">
              <tbody>
                {[...porCliente.entries()].map(([nombre, total]) => (
                  <tr key={nombre} className="border-b border-brand-100 last:border-0">
                    <td className="py-2 text-brand-900">{nombre}</td>
                    <td className="text-right">{formatMoney(total)}</td>
                  </tr>
                ))}
                {porCliente.size === 0 && (
                  <tr>
                    <td className="py-2 text-brand-500">Sin datos en el período.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
