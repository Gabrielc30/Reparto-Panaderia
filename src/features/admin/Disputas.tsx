import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useDisputes, useInvalidateAdmin } from './hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'

export function Disputas() {
  const { data: disputes, isLoading } = useDisputes()
  const invalidate = useInvalidateAdmin()
  const [comentarios, setComentarios] = useState<Record<string, string>>({})
  const [resolving, setResolving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function resolver(dispatchId: string) {
    setResolving(dispatchId)
    setError(null)
    const { error: fnError } = await supabase.functions.invoke('resolver-disputa', {
      body: { dispatch_id: dispatchId, comentario_admin: comentarios[dispatchId] || '' },
    })
    setResolving(null)
    if (fnError) {
      setError(fnError.message)
      return
    }
    void invalidate('admin-disputes')
    void invalidate('admin-dashboard')
  }

  if (isLoading) return <p className="text-brand-500">Cargando disputas…</p>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-900">Disputas pendientes</h1>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      {disputes?.length === 0 && (
        <Card>
          <p className="text-brand-700">No hay disputas abiertas.</p>
        </Card>
      )}

      {disputes?.map((d) => (
        <Card key={d.id}>
          <p className="mb-1 font-semibold text-brand-900">
            {(d as { users?: { nombre: string } }).users?.nombre} · {d.fecha}
          </p>
          {d.comentario_repartidor && (
            <p className="mb-2 text-sm text-brand-700">Motivo: {d.comentario_repartidor}</p>
          )}
          <div className="mb-3 space-y-1 text-sm">
            {(d as { dispatch_items: { products: { nombre: string }; cantidad_despachada_panadero: number; cantidad_confirmada_repartidor: number | null }[] }).dispatch_items.map(
              (item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-brand-900">{item.products.nombre}</span>
                  <span>
                    Despachado: {item.cantidad_despachada_panadero} · Confirmado:{' '}
                    {item.cantidad_confirmada_repartidor ?? '—'}
                  </span>
                </div>
              ),
            )}
          </div>
          <TextField
            label="Comentario de resolución"
            value={comentarios[d.id] ?? ''}
            onChange={(e) => setComentarios((c) => ({ ...c, [d.id]: e.target.value }))}
          />
          <Button
            className="mt-3"
            onClick={() => resolver(d.id)}
            disabled={resolving === d.id}
          >
            {resolving === d.id ? 'Resolviendo…' : 'Marcar como resuelto'}
          </Button>
        </Card>
      ))}
    </div>
  )
}
