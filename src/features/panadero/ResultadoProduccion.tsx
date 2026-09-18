import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProduccionDetalle } from './hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { NumberStepper } from '../../components/NumberStepper'
import { CardSkeleton } from '../../components/Skeleton'
import { queueMutation } from '../../lib/syncManager'
import type { ProduccionConDetalle } from '../../types/domain'

export function ResultadoProduccion() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useProduccionDetalle(id)
  const produccion = data as unknown as ProduccionConDetalle | undefined

  const productos = useMemo(() => {
    if (!produccion) return []
    const map = new Map<string, { id: string; nombre: string; unidad_medida: string }>()
    for (const insumo of produccion.produccion_insumos) {
      map.set(insumo.products.id, insumo.products)
    }
    return [...map.values()]
  }, [produccion])

  const [cantidades, setCantidades] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) return <CardSkeleton rows={2} />
  if (!produccion) return <p className="text-brand-500">Producción no encontrada.</p>

  const yaCocinado = produccion.estado === 'cocinado'

  async function handleSubmit() {
    const resultados = productos
      .filter((p) => Number(cantidades[p.id]) > 0)
      .map((p) => ({
        producto_id: p.id,
        cantidad_obtenida: Number(cantidades[p.id]),
        unidad_medida: p.unidad_medida,
      }))

    if (resultados.length === 0) {
      setError('Ingresá la cantidad obtenida de al menos un producto.')
      return
    }

    setSubmitting(true)
    setError(null)
    const result = await queueMutation('cargar_resultado_produccion', {
      produccion_id: produccion!.id,
      resultados,
    })
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'No se pudo guardar el resultado.')
      return
    }
    navigate('/panadero/produccion')
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold text-brand-900">
            {produccion.turnos_produccion.nombre} · {produccion.fecha}
          </p>
          <Badge tone={yaCocinado ? 'success' : 'neutral'}>{yaCocinado ? 'Cocinado' : 'Pendiente'}</Badge>
        </div>
        <p className="mb-3 text-sm font-medium text-brand-900">Insumos usados</p>
        <div className="space-y-1 text-sm text-brand-700">
          {produccion.produccion_insumos.map((i) => (
            <div key={i.id} className="flex justify-between">
              <span>
                {i.products.nombre} — {i.insumo.nombre}
              </span>
              <span>
                {i.cantidad} {i.unidad_medida}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {yaCocinado ? (
        <Card>
          <p className="mb-3 font-semibold text-brand-900">Resultado ya cargado</p>
          <p className="text-sm text-brand-500">Esta producción quedó cerrada y es de solo lectura.</p>
        </Card>
      ) : (
        <Card>
          <p className="mb-3 font-semibold text-brand-900">Cantidad obtenida</p>
          <div className="space-y-3">
            {productos.map((producto) => (
              <NumberStepper
                key={producto.id}
                label={`${producto.nombre} (${producto.unidad_medida})`}
                value={Number(cantidades[producto.id] || 0)}
                onChange={(v) => setCantidades((c) => ({ ...c, [producto.id]: String(v) }))}
                step={0.01}
              />
            ))}
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

          <Button className="mt-4" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Guardando…' : 'Guardar resultado'}
          </Button>
        </Card>
      )}
    </div>
  )
}
