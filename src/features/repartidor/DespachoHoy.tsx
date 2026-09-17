import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTodayDispatches } from './hooks'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { queueMutation } from '../../lib/syncManager'
import type { DispatchWithItems } from '../../types/domain'

const estadoTone: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
  pendiente: 'neutral',
  confirmado: 'success',
  en_disputa: 'danger',
  resuelto: 'warning',
}

const estadoLabel: Record<string, string> = {
  pendiente: 'Pendiente de confirmar',
  confirmado: 'Confirmado',
  en_disputa: 'En disputa',
  resuelto: 'Resuelto por admin',
}

export function DespachoHoy() {
  const { data: dispatches, isLoading } = useTodayDispatches()

  if (isLoading) return <p className="text-brand-500">Cargando despacho…</p>

  if (!dispatches || dispatches.length === 0) {
    return (
      <Card>
        <p className="text-brand-700">Todavía no tenés un despacho cargado para hoy.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {dispatches.map((dispatch) => (
        <DispatchCard key={dispatch.id} dispatch={dispatch} />
      ))}
    </div>
  )
}

function DispatchCard({ dispatch }: { dispatch: DispatchWithItems }) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      dispatch.dispatch_items.map((item) => [
        item.id,
        String(item.cantidad_confirmada_repartidor ?? item.cantidad_despachada_panadero),
      ]),
    ),
  )
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const editable = dispatch.estado === 'pendiente'
  const hayDiferencias = dispatch.dispatch_items.some(
    (item) => Number(values[item.id]) !== item.cantidad_despachada_panadero,
  )

  async function handleConfirm() {
    setSubmitting(true)
    await queueMutation('confirmar_despacho', {
      dispatch_id: dispatch.id,
      comentario_repartidor: comentario || null,
      items: dispatch.dispatch_items.map((item) => ({
        id: item.id,
        cantidad_confirmada_repartidor: Number(values[item.id]),
      })),
    })
    setSubmitting(false)
    setSent(true)
    void queryClient.invalidateQueries({ queryKey: ['dispatches', 'today'] })
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold text-brand-900">Despacho de hoy</p>
        <Badge tone={estadoTone[dispatch.estado] ?? 'neutral'}>
          {estadoLabel[dispatch.estado] ?? dispatch.estado}
        </Badge>
      </div>

      <div className="space-y-3">
        {dispatch.dispatch_items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-brand-900">{item.products.nombre}</p>
              <p className="text-xs text-brand-500">
                Despachado: {item.cantidad_despachada_panadero} {item.products.unidad_medida}
              </p>
            </div>
            {editable ? (
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                className="w-24 rounded-lg border-2 border-brand-100 px-3 py-2 text-right"
                value={values[item.id]}
                onChange={(e) => setValues((v) => ({ ...v, [item.id]: e.target.value }))}
              />
            ) : (
              <p className="font-semibold text-brand-900">
                {item.cantidad_confirmada_repartidor ?? '—'}
              </p>
            )}
          </div>
        ))}
      </div>

      {editable && !sent && (
        <div className="mt-4 space-y-3">
          {hayDiferencias && (
            <TextField
              label="Motivo de la diferencia (queda como disputa)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Ej: faltaron 5 unidades de flauta"
            />
          )}
          <Button onClick={handleConfirm} disabled={submitting}>
            {hayDiferencias ? 'Reportar diferencia' : 'Confirmar despacho'}
          </Button>
        </div>
      )}

      {sent && <p className="mt-3 text-sm font-medium text-brand-700">Enviado. Se sincroniza automáticamente.</p>}
    </Card>
  )
}
