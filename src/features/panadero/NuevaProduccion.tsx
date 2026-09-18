import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useProducts, useTurnosActivos } from './hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { SelectField } from '../../components/SelectField'
import { queueMutation } from '../../lib/syncManager'
import { todayISO } from '../../lib/date'

interface InsumoRow {
  key: string
  insumo_id: string
  cantidad: string
}

interface ProductoLinea {
  key: string
  producto_id: string
  insumos: InsumoRow[]
}

function newInsumoRow(): InsumoRow {
  return { key: crypto.randomUUID(), insumo_id: '', cantidad: '' }
}

function newLinea(): ProductoLinea {
  return { key: crypto.randomUUID(), producto_id: '', insumos: [newInsumoRow()] }
}

export function NuevaProduccion() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { data: turnos, isLoading: cargandoTurnos } = useTurnosActivos()
  const { data: products } = useProducts()

  const productosElaborables = (products ?? []).filter((p) => p.tipo === 'venta_normal')
  const materiasPrimas = (products ?? []).filter((p) => p.tipo === 'materia_prima')

  const [turnoId, setTurnoId] = useState('')
  const [fecha, setFecha] = useState(todayISO())
  const [lineas, setLineas] = useState<ProductoLinea[]>([newLinea()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateLinea(key: string, patch: Partial<ProductoLinea>) {
    setLineas((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  }

  function addLinea() {
    setLineas((ls) => [...ls, newLinea()])
  }

  function removeLinea(key: string) {
    setLineas((ls) => ls.filter((l) => l.key !== key))
  }

  function updateInsumo(lineaKey: string, insumoKey: string, patch: Partial<InsumoRow>) {
    setLineas((ls) =>
      ls.map((l) =>
        l.key === lineaKey
          ? { ...l, insumos: l.insumos.map((i) => (i.key === insumoKey ? { ...i, ...patch } : i)) }
          : l,
      ),
    )
  }

  function addInsumo(lineaKey: string) {
    setLineas((ls) => ls.map((l) => (l.key === lineaKey ? { ...l, insumos: [...l.insumos, newInsumoRow()] } : l)))
  }

  function removeInsumo(lineaKey: string, insumoKey: string) {
    setLineas((ls) =>
      ls.map((l) => (l.key === lineaKey ? { ...l, insumos: l.insumos.filter((i) => i.key !== insumoKey) } : l)),
    )
  }

  async function handleSubmit() {
    if (!profile || !turnoId) return

    const insumosPlanos: { producto_id: string; insumo_id: string; cantidad: number; unidad_medida: string }[] = []
    for (const linea of lineas) {
      if (!linea.producto_id) continue
      for (const insumo of linea.insumos) {
        if (!insumo.insumo_id || Number(insumo.cantidad) <= 0) continue
        const materiaPrima = materiasPrimas.find((m) => m.id === insumo.insumo_id)
        insumosPlanos.push({
          producto_id: linea.producto_id,
          insumo_id: insumo.insumo_id,
          cantidad: Number(insumo.cantidad),
          unidad_medida: materiaPrima?.unidad_medida ?? 'unidad',
        })
      }
    }

    if (insumosPlanos.length === 0) {
      setError('Agregá al menos un producto con un insumo y cantidad.')
      return
    }

    setSubmitting(true)
    setError(null)
    const result = await queueMutation('crear_produccion', {
      turno_id: turnoId,
      fecha,
      insumos: insumosPlanos,
    })
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'No se pudo guardar la producción.')
      return
    }
    navigate('/panadero/produccion')
  }

  if (!cargandoTurnos && (turnos ?? []).length === 0) {
    return (
      <Card>
        <p className="mb-2 font-semibold text-brand-900">No hay turnos configurados</p>
        <p className="text-sm text-brand-700">
          Pedile al admin que cree al menos un turno de producción activo antes de cargar una producción.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Turno" value={turnoId} onChange={(e) => setTurnoId(e.target.value)}>
            <option value="">Seleccioná…</option>
            {turnos?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </SelectField>
          <TextField label="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </Card>

      {lineas.map((linea) => (
        <Card key={linea.key}>
          <SelectField
            label="Producto a elaborar"
            value={linea.producto_id}
            onChange={(e) => updateLinea(linea.key, { producto_id: e.target.value })}
          >
            <option value="">Elegir…</option>
            {productosElaborables.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </SelectField>

          <p className="mt-4 mb-2 text-sm font-semibold text-brand-900">Insumos usados</p>
          <div className="space-y-3">
            {linea.insumos.map((insumo) => {
              const materiaPrima = materiasPrimas.find((m) => m.id === insumo.insumo_id)
              return (
                <div key={insumo.key} className="rounded-xl border border-brand-100 p-3">
                  <SelectField
                    label="Insumo"
                    value={insumo.insumo_id}
                    onChange={(e) => updateInsumo(linea.key, insumo.key, { insumo_id: e.target.value })}
                  >
                    <option value="">Elegir…</option>
                    {materiasPrimas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} (stock: {m.stock} {m.unidad_medida})
                      </option>
                    ))}
                  </SelectField>
                  <div className="mt-2 flex items-end gap-2">
                    <div className="flex-1">
                      <TextField
                        label={`Cantidad${materiaPrima ? ` (${materiaPrima.unidad_medida})` : ''}`}
                        type="number"
                        min={0}
                        step="0.01"
                        value={insumo.cantidad}
                        onChange={(e) => updateInsumo(linea.key, insumo.key, { cantidad: e.target.value })}
                      />
                    </div>
                    {linea.insumos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInsumo(linea.key, insumo.key)}
                        className="pb-3 text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <Button variant="secondary" className="mt-3" onClick={() => addInsumo(linea.key)}>
            + Agregar insumo
          </Button>

          {lineas.length > 1 && (
            <button
              type="button"
              onClick={() => removeLinea(linea.key)}
              className="mt-3 text-sm text-red-600"
            >
              Quitar producto
            </button>
          )}
        </Card>
      ))}

      <Button variant="secondary" onClick={addLinea}>
        + Agregar otro producto
      </Button>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting || !turnoId}>
        {submitting ? 'Guardando…' : 'Guardar producción'}
      </Button>
    </div>
  )
}
