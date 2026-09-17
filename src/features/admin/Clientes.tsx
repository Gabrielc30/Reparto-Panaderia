import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../auth/AuthContext'
import { useAdminClients, useInvalidateAdmin } from './hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { SelectField } from '../../components/SelectField'
import { formatMoney } from '../../lib/date'
import type { Client, CondicionPago } from '../../types/domain'

const emptyForm = {
  nombre_negocio: '',
  direccion: '',
  contacto: '',
  condicion_pago: 'contado' as CondicionPago,
}

export function Clientes() {
  const { profile } = useAuth()
  const { data: clients, isLoading } = useAdminClients()
  const invalidate = useInvalidateAdmin()
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(client: Client) {
    setEditing(client)
    setForm({
      nombre_negocio: client.nombre_negocio,
      direccion: client.direccion ?? '',
      contacto: client.contacto ?? '',
      condicion_pago: client.condicion_pago as CondicionPago,
    })
    setOpen(true)
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    if (editing) {
      await supabase
        .from('clients')
        .update({
          nombre_negocio: form.nombre_negocio,
          direccion: form.direccion || null,
          contacto: form.contacto || null,
          condicion_pago: form.condicion_pago,
        })
        .eq('id', editing.id)
    } else {
      await supabase.from('clients').insert({
        nombre_negocio: form.nombre_negocio,
        direccion: form.direccion || null,
        contacto: form.contacto || null,
        condicion_pago: form.condicion_pago,
        panaderia_id: profile.panaderia_id,
      })
    }
    setSaving(false)
    setOpen(false)
    void invalidate('admin-clients')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-brand-900">Clientes</h1>
        <Button className="w-auto px-4 py-2" onClick={openCreate}>
          + Nuevo
        </Button>
      </div>

      {open && (
        <Card>
          <p className="mb-3 font-semibold text-brand-900">{editing ? 'Editar cliente' : 'Nuevo cliente'}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Nombre del negocio"
              value={form.nombre_negocio}
              onChange={(e) => setForm((f) => ({ ...f, nombre_negocio: e.target.value }))}
            />
            <TextField
              label="Dirección"
              value={form.direccion}
              onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
            />
            <TextField
              label="Contacto"
              value={form.contacto}
              onChange={(e) => setForm((f) => ({ ...f, contacto: e.target.value }))}
            />
            <SelectField
              label="Condición de pago"
              value={form.condicion_pago}
              onChange={(e) => setForm((f) => ({ ...f, condicion_pago: e.target.value as CondicionPago }))}
            >
              <option value="contado">Contado</option>
              <option value="cuenta_corriente">Cuenta corriente</option>
            </SelectField>
          </div>
          <div className="mt-4 flex gap-2">
            <Button className="w-auto px-4 py-2" onClick={handleSave} disabled={saving || !form.nombre_negocio}>
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
                  <th>Condición</th>
                  <th>Saldo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clients?.map((c) => (
                  <tr key={c.id} className="border-b border-brand-100 last:border-0">
                    <td className="py-2 font-medium text-brand-900">{c.nombre_negocio}</td>
                    <td className="capitalize">{c.condicion_pago.replace('_', ' ')}</td>
                    <td className={c.saldo_actual > 0 ? 'font-semibold text-red-600' : ''}>
                      {formatMoney(c.saldo_actual)}
                    </td>
                    <td>
                      <button onClick={() => openEdit(c)} className="text-brand-700 underline">
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
