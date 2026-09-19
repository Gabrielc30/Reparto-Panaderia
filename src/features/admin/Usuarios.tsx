import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { describeFunctionError } from '../../lib/functionError'
import { useAuth } from '../../auth/AuthContext'
import { useAdminUsers, useInvalidateAdmin } from './hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { SelectField } from '../../components/SelectField'
import { Badge } from '../../components/Badge'
import { TableSkeleton } from '../../components/Skeleton'
import type { EstadoUsuario, Rol } from '../../types/domain'

const emptyForm = {
  nombre: '',
  email: '',
  password: '',
  rol: 'repartidor' as Rol,
  telefono: '',
  zona_asignada: '',
}

export function Usuarios() {
  const { profile } = useAuth()
  const { data: users, isLoading } = useAdminUsers()
  const invalidate = useInvalidateAdmin()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!profile) return
    setSaving(true)
    setError(null)
    const { error: fnError } = await supabase.functions.invoke('crear-usuario', {
      body: {
        panaderia_id: profile.panaderia_id,
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        rol: form.rol,
        telefono: form.telefono || null,
        zona_asignada: form.zona_asignada || null,
      },
    })
    setSaving(false)
    if (fnError) {
      setError(await describeFunctionError(fnError))
      return
    }
    setOpen(false)
    setForm(emptyForm)
    void invalidate('admin-users')
  }

  async function toggleEstado(userId: string, estado: EstadoUsuario) {
    await supabase
      .from('users')
      .update({ estado: estado === 'activo' ? 'inactivo' : 'activo' })
      .eq('id', userId)
    void invalidate('admin-users')
  }

  async function changeRol(userId: string, rol: Rol) {
    await supabase.from('users').update({ rol }).eq('id', userId)
    void invalidate('admin-users')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900">Usuarios</h1>
        <Button className="w-auto px-4 py-2" onClick={() => setOpen(true)}>
          + Nuevo
        </Button>
      </div>

      {open && (
        <Card>
          <p className="mb-3 font-semibold text-brand-900">Nuevo usuario</p>
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <TextField
              label="Contraseña provisoria"
              type="text"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <SelectField
              label="Rol"
              value={form.rol}
              onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value as Rol }))}
            >
              <option value="admin">Admin</option>
              <option value="panadero">Panadero</option>
              <option value="repartidor">Repartidor</option>
            </SelectField>
            <TextField
              label="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
            />
            {form.rol === 'repartidor' && (
              <TextField
                label="Zona asignada"
                value={form.zona_asignada}
                onChange={(e) => setForm((f) => ({ ...f, zona_asignada: e.target.value }))}
              />
            )}
          </div>
          {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-4 flex gap-2">
            <Button
              className="w-auto px-4 py-2"
              onClick={handleCreate}
              disabled={saving || !form.nombre || !form.email || !form.password}
            >
              Crear usuario
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
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u.id} className="border-b border-brand-100 last:border-0">
                    <td className="py-2 font-medium text-brand-900">{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.rol}
                        onChange={(e) => void changeRol(u.id, e.target.value as Rol)}
                        className="rounded border border-brand-100 px-2 py-1"
                      >
                        <option value="admin">Admin</option>
                        <option value="panadero">Panadero</option>
                        <option value="repartidor">Repartidor</option>
                      </select>
                    </td>
                    <td>
                      <Badge tone={u.estado === 'activo' ? 'success' : 'danger'}>{u.estado}</Badge>
                    </td>
                    <td>
                      <button
                        onClick={() => void toggleEstado(u.id, u.estado as EstadoUsuario)}
                        className="text-brand-700 underline"
                      >
                        {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
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
