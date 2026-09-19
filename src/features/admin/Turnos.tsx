import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../auth/AuthContext'
import { useAdminTurnos, useInvalidateAdmin } from './hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { Badge } from '../../components/Badge'
import { TableSkeleton } from '../../components/Skeleton'
import type { TurnoProduccion } from '../../types/domain'

const emptyForm = { nombre: '', orden: '0' }

export function Turnos() {
  const { profile } = useAuth()
  const { data: turnos, isLoading } = useAdminTurnos()
  const invalidate = useInvalidateAdmin()
  const [editing, setEditing] = useState<TurnoProduccion | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditing(null)
    setForm({ nombre: '', orden: String((turnos?.length ?? 0) + 1) })
    setOpen(true)
  }

  function openEdit(turno: TurnoProduccion) {
    setEditing(turno)
    setForm({ nombre: turno.nombre, orden: String(turno.orden) })
    setOpen(true)
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    if (editing) {
      await supabase
        .from('turnos_produccion')
        .update({ nombre: form.nombre, orden: Number(form.orden) })
        .eq('id', editing.id)
    } else {
      await supabase.from('turnos_produccion').insert({
        panaderia_id: profile.panaderia_id,
        nombre: form.nombre,
        orden: Number(form.orden),
      })
    }
    setSaving(false)
    setOpen(false)
    void invalidate('admin-turnos')
  }

  async function toggleActivo(turno: TurnoProduccion) {
    await supabase.from('turnos_produccion').update({ activo: !turno.activo }).eq('id', turno.id)
    void invalidate('admin-turnos')
  }

  const sinTurnosActivos = (turnos ?? []).every((t) => !t.activo)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900">Turnos de producción</h1>
        <Button className="w-auto px-4 py-2" onClick={openCreate}>
          + Nuevo
        </Button>
      </div>

      {!isLoading && sinTurnosActivos && (
        <Card className="border-amber-300 bg-amber-50">
          <p className="text-sm text-amber-800">
            No hay ningún turno activo. El panadero no va a poder cargar producciones hasta que crees o
            actives al menos uno.
          </p>
        </Card>
      )}

      {open && (
        <Card>
          <p className="mb-3 font-semibold text-brand-900">{editing ? 'Editar turno' : 'Nuevo turno'}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Nombre"
              placeholder="Ej: Mañana, Tarde, Noche"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
            <TextField
              label="Orden"
              type="number"
              min={0}
              value={form.orden}
              onChange={(e) => setForm((f) => ({ ...f, orden: e.target.value }))}
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
          <TableSkeleton cols={3} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-100 text-brand-500">
                  <th className="py-2">Nombre</th>
                  <th>Orden</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {turnos?.map((t) => (
                  <tr key={t.id} className="border-b border-brand-100 last:border-0">
                    <td className="py-2 font-medium text-brand-900">{t.nombre}</td>
                    <td>{t.orden}</td>
                    <td>
                      <Badge tone={t.activo ? 'success' : 'danger'}>{t.activo ? 'activo' : 'inactivo'}</Badge>
                    </td>
                    <td className="space-x-3">
                      <button onClick={() => openEdit(t)} className="text-brand-700 underline">
                        Editar
                      </button>
                      <button onClick={() => void toggleActivo(t)} className="text-brand-700 underline">
                        {t.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
                {turnos?.length === 0 && (
                  <tr>
                    <td className="py-2 text-brand-500" colSpan={4}>
                      Sin turnos todavía.
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
