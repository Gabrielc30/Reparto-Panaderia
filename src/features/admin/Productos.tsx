import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../auth/AuthContext'
import { useAdminProducts, useInvalidateAdmin } from './hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { SelectField } from '../../components/SelectField'
import { formatMoney } from '../../lib/date'
import type { Product, TipoProducto, UnidadMedida } from '../../types/domain'

const emptyForm = {
  nombre: '',
  tipo: 'venta_normal' as TipoProducto,
  unidad_medida: 'unidad' as UnidadMedida,
  precio_unitario: '0',
  stock: '0',
}

export function Productos() {
  const { profile } = useAuth()
  const { data: products, isLoading } = useAdminProducts()
  const invalidate = useInvalidateAdmin()
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
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
      precio_unitario: Number(form.precio_unitario),
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
        <h1 className="text-xl font-bold text-brand-900">Productos</h1>
        <Button className="w-auto px-4 py-2" onClick={openCreate}>
          + Nuevo
        </Button>
      </div>

      {open && (
        <Card>
          <p className="mb-3 font-semibold text-brand-900">{editing ? 'Editar producto' : 'Nuevo producto'}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
            <SelectField
              label="Tipo"
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoProducto }))}
            >
              <option value="venta_normal">Venta normal</option>
              <option value="insumo_interno">Insumo interno</option>
            </SelectField>
            <SelectField
              label="Unidad de medida"
              value={form.unidad_medida}
              onChange={(e) => setForm((f) => ({ ...f, unidad_medida: e.target.value as UnidadMedida }))}
            >
              <option value="unidad">Unidad</option>
              <option value="kg">Kg</option>
            </SelectField>
            <TextField
              label="Precio unitario"
              type="number"
              min={0}
              step="0.01"
              value={form.precio_unitario}
              onChange={(e) => setForm((f) => ({ ...f, precio_unitario: e.target.value }))}
            />
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
          <p className="text-brand-500">Cargando…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-brand-500">
                  <th className="py-2">Nombre</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products?.map((p) => (
                  <tr key={p.id} className="border-b border-brand-100 last:border-0">
                    <td className="py-2 font-medium text-brand-900">{p.nombre}</td>
                    <td className="capitalize">{p.tipo.replace('_', ' ')}</td>
                    <td>{formatMoney(p.precio_unitario)}</td>
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
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
