import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { Rol } from '../types/domain'

export function ProtectedRoute({ roles, children }: { roles: Rol[]; children: ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-brand-700">
        Cargando…
      </div>
    )
  }

  if (!session || !profile) {
    return <Navigate to="/login" replace />
  }

  if (profile.estado !== 'activo') {
    return (
      <div className="flex h-screen items-center justify-center px-6 text-center text-brand-700">
        Tu cuenta está inactiva. Contactá al administrador.
      </div>
    )
  }

  if (!roles.includes(profile.rol as Rol)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
