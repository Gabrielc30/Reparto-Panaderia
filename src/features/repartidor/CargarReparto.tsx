import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useClients, useTodayDispatches } from './hooks'
import { useProducts } from '../panadero/hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { SelectField } from '../../components/SelectField'
import { queueMutation } from '../../lib/syncManager'
import { formatMoney } from '../../lib/date'
import type { FormaPagoCobro, TipoMovimiento } from '../../types/domain'

interface ItemRow {
  key: string
  producto_id: string
  tipo_movimiento: TipoMovimiento
  cantidad: string
  precio_unitario: string
  forma_pago: 'efectivo' | 'transferencia' | 'cuenta_corriente'
}

function newRow(defaultProductId: string): ItemRow {
  return {
    key: crypto.randomUUID(),
    producto_id: defaultProductId,
    tipo_movimiento: 'venta',
    cantidad: '1',
    precio_unitario: '0',
    forma_pago: 'efectivo',
  }
}

export function CargarReparto() {
  const { profile } = useAuth()
  const { data: clients } = useClients()
  const { data: dispatches } = useTodayDispatches()
  const esAdmin = profile?.rol === 'admin'
  const { data: allProducts } = useProducts()

  const productos = useMemo(() => {
    // El admin no depende de un despacho: vende directo del catálogo, como dueño.
    if (esAdmin) {
      return (allProducts ?? []).filter((p) => p.tipo === 'venta_normal')
    }
    const map = new Map<string, { id: string; nombre: string; precio_unitario: number; unidad_medida: string }>()
    for (const dispatch of dispatches ?? []) {
      if (dispatch.estado !== 'confirmado' && dispatch.estado !== 'resuelto') continue
      for (const item of dispatch.dispatch_items) {
        map.set(item.products.id, item.products)
      }
    }
    return [...map.values()]
  }, [esAdmin, allProducts, dispatches])

  const [clienteId, setClienteId] = useState('')
  const [items, setItems] = useState<ItemRow[]>(() => [newRow('')])
  const [observaciones, setObservaciones] = useState('')
  const [cobroActivo, setCobroActivo] = useState(false)
  const [cobroMonto, setCobroMonto] = useState('')
  const [cobroForma, setCobroForma] = useState<FormaPagoCobro>('efectivo')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cliente = clients?.find((c) => c.id === clienteId)

  function updateItem(key: string, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  function addItem() {
    setItems((rows) => [...rows, newRow(productos[0]?.id ?? '')])
  }

  function removeItem(key: string) {
    setItems((rows) => rows.filter((row) => row.key !== key))
  }

  function onProductChange(key: string, producto_id: string) {
    const producto = productos.find((p) => p.id === producto_id)
    updateItem(key, {
      producto_id,
      precio_unitario: producto ? String(producto.precio_unitario) : '0',
    })
  }

  const montoTotal = items.reduce((sum, row) => {
    if (row.tipo_movimiento !== 'venta') return sum
    return sum + Number(row.cantidad || 0) * Number(row.precio_unitario || 0)
  }, 0)

  async function handleSubmit() {
    if (!profile || !clienteId || items.length === 0) return

    const deliveryItems = items
      .filter((row) => row.producto_id && Number(row.cantidad) > 0)
      .map((row) => {
        if (row.tipo_movimiento === 'cambio') {
          return {
            producto_id: row.producto_id,
            cantidad: Number(row.cantidad),
            tipo_movimiento: 'cambio',
            cantidad_retirada: Number(row.cantidad),
            precio_unitario: null,
            forma_pago: null,
          }
        }
        return {
          producto_id: row.producto_id,
          cantidad: Number(row.cantidad),
          tipo_movimiento: 'venta',
          cantidad_retirada: null,
          precio_unitario: Number(row.precio_unitario),
          forma_pago: row.forma_pago,
        }
      })

    if (deliveryItems.length === 0) {
      setError('Agregá al menos un producto con cantidad antes de guardar.')
      return
    }

    setSubmitting(true)
    setError(null)

    const result = await queueMutation('cargar_reparto', {
      delivery: {
        panaderia_id: profile.panaderia_id,
        cliente_id: clienteId,
        repartidor_id: profile.id,
        monto_total: montoTotal,
        observaciones: observaciones || null,
      },
      items: deliveryItems,
      pago:
        cobroActivo && Number(cobroMonto) > 0
          ? {
              panaderia_id: profile.panaderia_id,
              cliente_id: clienteId,
              monto: Number(cobroMonto),
              forma_pago: cobroForma,
              registrado_por_id: profile.id,
            }
          : undefined,
    })

    setSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'No se pudo guardar el reparto.')
      return
    }
    setSuccess(true)
    setItems([newRow('')])
    setObservaciones('')
    setCobroActivo(false)
    setCobroMonto('')
    setClienteId('')
  }

  if (success) {
    return (
      <Card>
        <p className="mb-4 font-semibold text-brand-900">Reparto cargado ✅</p>
        <p className="mb-4 text-sm text-brand-500">
          Se guardó y se sincroniza automáticamente cuando haya conexión.
        </p>
        <Button onClick={() => setSuccess(false)}>Cargar otro reparto</Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <SelectField label="Cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Seleccioná un cliente</option>
          {clients?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre_negocio}
            </option>
          ))}
        </SelectField>
        {cliente && cliente.condicion_pago === 'cuenta_corriente' && (
          <p className="mt-2 text-sm text-brand-700">
            Saldo actual: <span className="font-semibold">{formatMoney(cliente.saldo_actual)}</span>
          </p>
        )}
      </Card>

      <Card>
        <p className="mb-3 font-semibold text-brand-900">Productos</p>
        <div className="space-y-4">
          {items.map((row) => (
            <div key={row.key} className="space-y-2 rounded-xl border border-brand-100 p-3">
              <SelectField
                label="Producto"
                value={row.producto_id}
                onChange={(e) => onProductChange(row.key, e.target.value)}
              >
                <option value="">Elegir…</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </SelectField>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateItem(row.key, { tipo_movimiento: 'venta' })}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                    row.tipo_movimiento === 'venta'
                      ? 'bg-brand-700 text-white'
                      : 'bg-brand-100 text-brand-700'
                  }`}
                >
                  Venta
                </button>
                <button
                  type="button"
                  onClick={() => updateItem(row.key, { tipo_movimiento: 'cambio' })}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                    row.tipo_movimiento === 'cambio'
                      ? 'bg-brand-700 text-white'
                      : 'bg-brand-100 text-brand-700'
                  }`}
                >
                  Cambio
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Cantidad"
                  type="number"
                  min={0}
                  step="0.01"
                  value={row.cantidad}
                  onChange={(e) => updateItem(row.key, { cantidad: e.target.value })}
                />
                {row.tipo_movimiento === 'venta' && (
                  <TextField
                    label="Precio unitario"
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.precio_unitario}
                    onChange={(e) => updateItem(row.key, { precio_unitario: e.target.value })}
                  />
                )}
              </div>

              {row.tipo_movimiento === 'venta' && (
                <SelectField
                  label="Forma de pago"
                  value={row.forma_pago}
                  onChange={(e) =>
                    updateItem(row.key, { forma_pago: e.target.value as ItemRow['forma_pago'] })
                  }
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cuenta_corriente">Cuenta corriente</option>
                </SelectField>
              )}

              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(row.key)}
                  className="text-sm text-red-600"
                >
                  Quitar producto
                </button>
              )}
            </div>
          ))}
        </div>
        <Button variant="secondary" className="mt-3" onClick={addItem}>
          + Agregar producto
        </Button>
      </Card>

      <Card>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={cobroActivo}
            onChange={(e) => setCobroActivo(e.target.checked)}
            className="h-5 w-5"
          />
          <span className="font-semibold text-brand-900">Cobrar cuenta corriente anterior</span>
        </label>
        {cobroActivo && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <TextField
              label="Monto cobrado"
              type="number"
              min={0}
              step="0.01"
              value={cobroMonto}
              onChange={(e) => setCobroMonto(e.target.value)}
            />
            <SelectField
              label="Forma de pago"
              value={cobroForma}
              onChange={(e) => setCobroForma(e.target.value as FormaPagoCobro)}
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </SelectField>
          </div>
        )}
      </Card>

      <Card>
        <TextField
          label="Observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </Card>

      <div className="rounded-xl bg-brand-100 p-4 text-center">
        <p className="text-sm text-brand-700">Total venta</p>
        <p className="text-2xl font-bold text-brand-900">{formatMoney(montoTotal)}</p>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting || !clienteId}>
        {submitting ? 'Guardando…' : 'Guardar reparto'}
      </Button>
    </div>
  )
}
