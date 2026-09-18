import { useHistorialPanadero } from './hooks'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { CardSkeleton } from '../../components/Skeleton'
import { formatDateTime } from '../../lib/date'

const estadoTone: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
  pendiente: 'neutral',
  confirmado: 'success',
  en_disputa: 'danger',
  resuelto: 'warning',
}

export function Historial() {
  const { data, isLoading } = useHistorialPanadero()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton rows={2} />
        <CardSkeleton rows={2} />
        <CardSkeleton rows={2} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-3 font-semibold text-brand-900">Despachos a repartidores</p>
        <div className="space-y-3">
          {data?.dispatches?.map((d) => (
            <div key={d.id} className="border-b border-brand-100 pb-2 last:border-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-brand-900">
                  {(d as { users?: { nombre: string } }).users?.nombre} · {d.fecha}
                </p>
                <Badge tone={estadoTone[d.estado] ?? 'neutral'}>{d.estado}</Badge>
              </div>
              <p className="text-xs text-brand-500">
                {(d as { dispatch_items?: { products: { nombre: string }; cantidad_despachada_panadero: number }[] }).dispatch_items
                  ?.map((i) => `${i.products.nombre} (${i.cantidad_despachada_panadero})`)
                  .join(', ')}
              </p>
            </div>
          ))}
          {data?.dispatches?.length === 0 && <p className="text-sm text-brand-500">Sin despachos.</p>}
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-semibold text-brand-900">Despachos al local</p>
        <div className="space-y-2">
          {data?.localDispatches?.map((d) => (
            <div key={d.id} className="flex justify-between border-b border-brand-100 py-2 last:border-0">
              <span className="text-brand-900">
                {(d as { products?: { nombre: string } }).products?.nombre}
              </span>
              <span className="text-brand-700">
                {d.cantidad} · {formatDateTime(d.created_at)}
              </span>
            </div>
          ))}
          {data?.localDispatches?.length === 0 && <p className="text-sm text-brand-500">Sin registros.</p>}
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-semibold text-brand-900">Conversiones a pan rallado</p>
        <div className="space-y-2">
          {data?.conversions?.map((c) => (
            <div key={c.id} className="border-b border-brand-100 py-2 last:border-0">
              <p className="text-brand-900">
                {c.pan_rallado_obtenido_kg} kg obtenido · {formatDateTime(c.created_at)}
              </p>
              <p className="text-xs text-brand-500">
                {c.bolsas_viejas_usadas} bolsas + {c.pan_suelto_usado_kg} kg suelto
              </p>
            </div>
          ))}
          {data?.conversions?.length === 0 && <p className="text-sm text-brand-500">Sin registros.</p>}
        </div>
      </Card>
    </div>
  )
}
