import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useProducts } from './hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { queueMutation } from '../../lib/syncManager'

export function PanRallado() {
  const { profile } = useAuth()
  const { data: products } = useProducts()
  const insumos = (products ?? []).filter((p) => p.tipo === 'insumo_interno')

  const [bolsas, setBolsas] = useState('')
  const [panSuelto, setPanSuelto] = useState('')
  const [panRallado, setPanRallado] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!profile) return
    setSubmitting(true)
    setError(null)
    try {
      await queueMutation('conversion_pan_rallado', {
        panaderia_id: profile.panaderia_id,
        responsable_id: profile.id,
        bolsas_viejas_usadas: Number(bolsas || 0),
        pan_suelto_usado_kg: Number(panSuelto || 0),
        pan_rallado_obtenido_kg: Number(panRallado || 0),
        observaciones: observaciones || null,
      })
      setSuccess(true)
      setBolsas('')
      setPanSuelto('')
      setPanRallado('')
      setObservaciones('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-3 font-semibold text-brand-900">Stock de insumos</p>
        <div className="space-y-1 text-sm">
          {insumos.map((p) => (
            <div key={p.id} className="flex justify-between">
              <span className="text-brand-700">{p.nombre}</span>
              <span className="font-semibold text-brand-900">
                {p.stock} {p.unidad_medida}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-semibold text-brand-900">Nueva conversión</p>
        <div className="space-y-3">
          <TextField
            label="Bolsas de pan viejo usadas"
            type="number"
            min={0}
            step="1"
            value={bolsas}
            onChange={(e) => setBolsas(e.target.value)}
          />
          <TextField
            label="Kg de pan suelto usado"
            type="number"
            min={0}
            step="0.01"
            value={panSuelto}
            onChange={(e) => setPanSuelto(e.target.value)}
          />
          <TextField
            label="Kg de pan rallado obtenido"
            type="number"
            min={0}
            step="0.01"
            value={panRallado}
            onChange={(e) => setPanRallado(e.target.value)}
          />
          <TextField
            label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>
      </Card>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {success && <p className="text-sm font-medium text-brand-700">Conversión registrada ✅</p>}

      <Button onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Guardando…' : 'Registrar conversión'}
      </Button>
    </div>
  )
}
