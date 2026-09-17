import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useCierreDia, useTodayDeliveries, useTodayDispatches } from './hooks'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { formatMoney, formatDateTime, todayISO } from '../../lib/date'
import { queueMutation } from '../../lib/syncManager'

export function ResumenDia() {
  const { profile } = useAuth()
  const { data: deliveries, isLoading } = useTodayDeliveries()
  const { data: dispatches } = useTodayDispatches()
  const { data: cierre, refetch: refetchCierre } = useCierreDia()
  const [closing, setClosing] = useState(false)
  const [closed, setClosed] = useState(false)

  const hayDisputa = dispatches?.some((d) => d.estado === 'en_disputa') ?? false
  const yaCerrado = cierre?.estado === 'cerrado' || closed

  const totalPorFormaPago = new Map<string, number>()
  let totalGeneral = 0
  for (const delivery of deliveries ?? []) {
    const items = (delivery as { delivery_items?: { tipo_movimiento: string; cantidad: number; precio_unitario: number | null; forma_pago: string | null }[] }).delivery_items ?? []
    for (const item of items) {
      if (item.tipo_movimiento !== 'venta') continue
      const monto = item.cantidad * (item.precio_unitario ?? 0)
      const forma = item.forma_pago ?? 'efectivo'
      totalPorFormaPago.set(forma, (totalPorFormaPago.get(forma) ?? 0) + monto)
      totalGeneral += monto
    }
  }

  async function handleCerrarDia() {
    if (!profile) return
    setClosing(true)
    await queueMutation('cerrar_dia', { repartidor_id: profile.id, fecha: todayISO() })
    setClosing(false)
    setClosed(true)
    void refetchCierre()
  }

  if (isLoading) return <p className="text-brand-500">Cargando resumen…</p>

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-2 font-semibold text-brand-900">Total del día</p>
        <p className="text-3xl font-bold text-brand-900">{formatMoney(totalGeneral)}</p>
        <div className="mt-3 space-y-1 text-sm text-brand-700">
          {[...totalPorFormaPago.entries()].map(([forma, monto]) => (
            <div key={forma} className="flex justify-between">
              <span className="capitalize">{forma.replace('_', ' ')}</span>
              <span>{formatMoney(monto)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-semibold text-brand-900">Repartos de hoy ({deliveries?.length ?? 0})</p>
        <div className="space-y-2">
          {(deliveries ?? []).map((delivery) => (
            <div key={delivery.id} className="flex justify-between border-b border-brand-100 py-2 last:border-0">
              <div>
                <p className="font-medium text-brand-900">
                  {(delivery as { clients?: { nombre_negocio: string } }).clients?.nombre_negocio}
                </p>
                <p className="text-xs text-brand-500">{formatDateTime(delivery.fecha_hora)}</p>
              </div>
              <p className="font-semibold text-brand-900">{formatMoney(delivery.monto_total)}</p>
            </div>
          ))}
          {(deliveries ?? []).length === 0 && <p className="text-sm text-brand-500">Sin repartos todavía.</p>}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold text-brand-900">Cierre del día</p>
          {yaCerrado ? (
            <Badge tone="success">Cerrado</Badge>
          ) : hayDisputa ? (
            <Badge tone="danger">Bloqueado por disputa</Badge>
          ) : (
            <Badge tone="neutral">Abierto</Badge>
          )}
        </div>
        {hayDisputa && !yaCerrado && (
          <p className="mb-3 text-sm text-red-600">
            Tenés un despacho en disputa. Resolvé la diferencia con el admin antes de cerrar.
          </p>
        )}
        <Button onClick={handleCerrarDia} disabled={closing || hayDisputa || yaCerrado} variant="primary">
          {yaCerrado ? 'Día cerrado' : closing ? 'Cerrando…' : 'Cerrar día'}
        </Button>
      </Card>
    </div>
  )
}
