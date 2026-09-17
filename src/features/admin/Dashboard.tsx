import { Link } from 'react-router-dom'
import { useDashboard } from './hooks'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { formatMoney } from '../../lib/date'

export function Dashboard() {
  const { data, isLoading } = useDashboard()

  if (isLoading) return <p className="text-brand-500">Cargando dashboard…</p>

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <p className="text-sm text-brand-500">Ventas de hoy</p>
        <p className="text-3xl font-bold text-brand-900">{formatMoney(data?.ventasHoy ?? 0)}</p>
      </Card>

      <Card>
        <p className="text-sm text-brand-500">Pan rallado en stock</p>
        <p className="text-3xl font-bold text-brand-900">
          {data?.panRallado?.stock ?? 0} <span className="text-lg">kg</span>
        </p>
      </Card>

      <Card>
        <p className="text-sm text-brand-500">Repartidor con más entregas hoy</p>
        <p className="text-2xl font-bold text-brand-900">{data?.topRepartidor?.nombre ?? '—'}</p>
        <p className="text-brand-700">{formatMoney(data?.topRepartidor?.total ?? 0)}</p>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold text-brand-900">Disputas pendientes</p>
          {(data?.disputasPendientes.length ?? 0) > 0 && (
            <Badge tone="danger">{data?.disputasPendientes.length}</Badge>
          )}
        </div>
        {(data?.disputasPendientes.length ?? 0) === 0 ? (
          <p className="text-sm text-brand-500">No hay disputas abiertas.</p>
        ) : (
          <div className="space-y-2">
            {data?.disputasPendientes.map((d) => (
              <div key={d.id} className="flex justify-between border-b border-brand-100 py-2 last:border-0">
                <span className="text-brand-900">
                  {(d as { users?: { nombre: string } }).users?.nombre} · {d.fecha}
                </span>
                <Link to="/admin/disputas" className="text-sm font-medium text-brand-700 underline">
                  Ver
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
