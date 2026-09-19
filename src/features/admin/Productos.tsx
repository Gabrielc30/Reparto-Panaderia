import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../auth/AuthContext'
import { useAdminProducts, useInvalidateAdmin } from './hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { SelectField } from '../../components/SelectField'
import { TableSkeleton } from '../../components/Skeleton'
import { formatMoney } from '../../lib/date'
import type { Product, TipoProducto, UnidadMedida } from '../../types/domain'

type Modo = 'venta' | 'insumos'

const tipoLabel: Record<string, string> = {
  venta_normal: 'Venta',
  insumo_interno: 'Insumo interno',
  materia_prima: 'Materia prima',
}

function emptyForm(modo: Modo) {
  return {
    nombre: '',
    tipo: (modo === 'venta' ? 'venta_normal' : 'materia_prima') as TipoProducto,
    unidad_medida: 'unidad' as UnidadMedida,
    precio_unitario: '0',
    stock: '0',
  }
}

function CatalogoProductos({ modo }: { modo: Modo }) {
  const esVenta = modo === 'venta'
  const singular = esVenta ? 'producto' : 'insumo'
  const { profile } = useAuth()
  const { data: products, isLoading } = useAdminProducts()
  const invalidate = useInvalidateAdmin()
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm(modo))
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const visibles = (products ?? []).filter((p) => (esVenta ? p.tipo === 'venta_normal' : p.tipo !== 'venta_normal'))

  function openCreate() {
    setEditing(null)
    setForm(emptyForm(modo))
    setOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setForm({
      nombre: product.nombre,
      tipo: product.tipo as TipoProducto,
      unidad_medida: product.unidad_medida as UnidadMedida,
      precio_unitario: String(product.precio_unitario),
      stock: String(product.stock),
    })
    setOpen(true)
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    const payload = {
      nombre: form.nombre,
      tipo: form.tipo,
      unidad_medida: form.unidad_medida,
      precio_unitario: esVenta ? Number(form.precio_unitario) : 0,
      stock: Number(form.stock),
    }
    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('products').insert({ ...payload, panaderia_id: profile.panaderia_id })
    }
    setSaving(false)
    setOpen(false)
    void invalidate('admin-products')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900">{esVenta ? 'Productos' : 'Insumos'}</h1>
        <Button className="w-auto px-4 py-2" onClick={openCreate}>
          + Nuevo
        </Button>
      </div>
      {!esVenta && (
        <p className="text-sm text-brand-500">
          Materias primas (harina, levadura…) e insumos internos (pan viejo, pan rallado). No se venden directamente.
        </p>
      )}

      {open && (
        <Card>
          <p className="mb-3 font-semibold text-brand-900">
            {editing ? `Editar ${singular}` : `Nuevo ${singular}`}
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
            {!esVenta && (
              <SelectField
                label="Tipo"
                value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoProducto }))}
              >
                <option value="materia_prima">Materia prima</option>
                <option value="insumo_interno">Insumo interno</option>
              </SelectField>
            )}
            <SelectField
              label="Unidad de medida"
              value={form.unidad_medida}
              onChange={(e) => setForm((f) => ({ ...f, unidad_medida: e.target.value as UnidadMedida }))}
            >
              <option value="unidad">Unidad</option>
              <option value="kg">Kg</option>
            </SelectField>
            {esVenta && (
              <TextField
                label="Precio unitario"
                type="number"
                min={0}
                step="0.01"
                value={form.precio_unitario}
                onChange={(e) => setForm((f) => ({ ...f, precio_unitario: e.target.value }))}
              />
            )}
            <TextField
              label="Stock"
              type="number"
              min={0}
              step="0.01"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button className="w-auto px-4 py-2" onClick={handleSave} disabled={saving || !form.nombre}>
              Guardar
            </Button>
            <Button variant="ghost" className="w-auto px-4 py-2" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <TableSkeleton cols={4} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-brand-500">
                  <th className="py-2">Nombre</th>
                  {!esVenta && <th>Tipo</th>}
                  {esVenta && <th>Precio</th>}
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((p) => (
                  <tr key={p.id} className="border-b border-brand-100 last:border-0">
                    <td className="py-2 font-medium text-brand-900">{p.nombre}</td>
                    {!esVenta && <td>{tipoLabel[p.tipo] ?? p.tipo}</td>}
                    {esVenta && <td>{formatMoney(p.precio_unitario)}</td>}
                    <td>
                      {p.stock} {p.unidad_medida}
                    </td>
                    <td>
                      <button onClick={() => openEdit(p)} className="text-brand-700 underline">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {visibles.length === 0 && (
                  <tr>
                    <td className="py-2 text-brand-500" colSpan={4}>
                      Sin {esVenta ? 'productos' : 'insumos'} todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export function Productos() {
  return <CatalogoProductos modo="venta" />
}

export function Insumos() {
  return <CatalogoProductos modo="insumos" />
}
