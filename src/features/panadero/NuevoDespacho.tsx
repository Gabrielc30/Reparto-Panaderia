import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useProducts, useRepartidores } from './hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { SelectField } from '../../components/SelectField'
import { NumberStepper } from '../../components/NumberStepper'
import { queueMutation } from '../../lib/syncManager'

interface Row {
  key: string
  producto_id: string
  cantidad: string
}

function newRow(): Row {
  return { key: crypto.randomUUID(), producto_id: '', cantidad: '' }
}

export function NuevoDespacho() {
  const { profile } = useAuth()
  const { data: products } = useProducts()
  const { data: repartidores } = useRepartidores()
  const [destino, setDestino] = useState<'repartidor' | 'local'>('repartidor')
  const [repartidorId, setRepartidorId] = useState('')
  const [rows, setRows] = useState<Row[]>([newRow()])
  const [observaciones, setObservaciones] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const productosVenta = (products ?? []).filter((p) => p.tipo === 'venta_normal')

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setRows((rs) => [...rs, newRow()])
  }

  function removeRow(key: string) {
    setRows((rs) => rs.filter((r) => r.key !== key))
  }

  async function handleSubmit() {
    if (!profile) return
    const validRows = rows.filter((r) => r.producto_id && Number(r.cantidad) > 0)
    if (validRows.length === 0) return
    setSubmitting(true)
    setError(null)

    if (destino === 'repartidor') {
      if (!repartidorId) {
        setSubmitting(false)
        return
      }
      const result = await queueMutation('nuevo_despacho', {
        dispatch: {
          panaderia_id: profile.panaderia_id,
          panadero_id: profile.id,
          repartidor_id: repartidorId,
        },
        items: validRows.map((r) => ({
          producto_id: r.producto_id,
          cantidad_despachada_panadero: Number(r.cantidad),
        })),
      })
      setSubmitting(false)
      if (!result.ok) {
        setError(result.error ?? 'No se pudo crear el despacho.')
        return
      }
    } else {
      for (const r of validRows) {
        const result = await queueMutation('nuevo_despacho_local', {
          panaderia_id: profile.panaderia_id,
          panadero_id: profile.id,
          producto_id: r.producto_id,
          cantidad: Number(r.cantidad),
          observaciones: observaciones || null,
        })
        if (!result.ok) {
          setSubmitting(false)
          setError(result.error ?? 'No se pudo crear el despacho.')
          return
        }
      }
      setSubmitting(false)
    }

    setSuccess(true)
    setRows([newRow()])
    setRepartidorId('')
    setObservaciones('')
  }

  if (success) {
    return (
      <Card>
        <p className="mb-4 font-semibold text-brand-900">Despacho creado ✅</p>
        <Button onClick={() => setSuccess(false)}>Cargar otro despacho</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDestino('repartidor')}
            className={`flex-1 rounded-lg py-3 text-sm font-semibold ${
              destino === 'repartidor' ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-700'
            }`}
          >
            A repartidor
          </button>
          <button
            type="button"
            onClick={() => setDestino('local')}
            className={`flex-1 rounded-lg py-3 text-sm font-semibold ${
              destino === 'local' ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-700'
            }`}
          >
            Al local
          </button>
        </div>
      </Card>

      {destino === 'repartidor' && (
        <Card>
          <SelectField
            label="Repartidor"
            value={repartidorId}
            onChange={(e) => setRepartidorId(e.target.value)}
          >
            <option value="">Seleccioná…</option>
            {repartidores?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </SelectField>
        </Card>
      )}

      <Card>
        <p className="mb-3 font-semibold text-brand-900">Productos</p>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.key} className="space-y-2 rounded-xl border border-brand-100 p-3">
              <SelectField
                label="Producto"
                value={row.producto_id}
                onChange={(e) => updateRow(row.key, { producto_id: e.target.value })}
              >
                <option value="">Elegir…</option>
                {productosVenta.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </SelectField>
              <NumberStepper
                label="Cantidad"
                value={Number(row.cantidad || 0)}
                onChange={(v) => updateRow(row.key, { cantidad: String(v) })}
                step={0.01}
              />
              {rows.length > 1 && (
                <button type="button" onClick={() => removeRow(row.key)} className="text-sm text-red-600">
                  Quitar producto
                </button>
              )}
            </div>
          ))}
        </div>
        <Button variant="secondary" className="mt-3" onClick={addRow}>
          + Agregar producto
        </Button>
      </Card>

      {destino === 'local' && (
        <Card>
          <TextField
            label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </Card>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={submitting || (destino === 'repartidor' && !repartidorId)}
      >
        {submitting ? 'Guardando…' : 'Crear despacho'}
      </Button>
    </div>
  )
}
