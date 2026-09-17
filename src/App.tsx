import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { MobileLayout } from './layouts/MobileLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { Login } from './features/auth/Login'

import { DespachoHoy } from './features/repartidor/DespachoHoy'
import { CargarReparto } from './features/repartidor/CargarReparto'
import { ResumenDia } from './features/repartidor/ResumenDia'

import { NuevoDespacho } from './features/panadero/NuevoDespacho'
import { PanRallado } from './features/panadero/PanRallado'
import { Historial } from './features/panadero/Historial'

import { Dashboard } from './features/admin/Dashboard'
import { Clientes } from './features/admin/Clientes'
import { Productos } from './features/admin/Productos'
import { Usuarios } from './features/admin/Usuarios'
import { Disputas } from './features/admin/Disputas'
import { Reportes } from './features/admin/Reportes'

const repartidorNav = [
  { to: '/repartidor', label: 'Despacho', icon: '📦' },
  { to: '/repartidor/cargar', label: 'Cargar', icon: '🧾' },
  { to: '/repartidor/resumen', label: 'Resumen', icon: '📅' },
]

const panaderoNav = [
  { to: '/panadero', label: 'Despacho', icon: '📦' },
  { to: '/panadero/pan-rallado', label: 'Pan rallado', icon: '🥖' },
  { to: '/panadero/historial', label: 'Historial', icon: '📋' },
]

function HomeRedirect() {
  const { profile } = useAuth()
  if (!profile) return <Navigate to="/login" replace />
  if (profile.rol === 'admin') return <Navigate to="/admin" replace />
  if (profile.rol === 'panadero') return <Navigate to="/panadero" replace />
  return <Navigate to="/repartidor" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/repartidor"
        element={
          <ProtectedRoute roles={['repartidor']}>
            <MobileLayout navItems={repartidorNav} title="Repartidor" />
          </ProtectedRoute>
        }
      >
        <Route index element={<DespachoHoy />} />
        <Route path="cargar" element={<CargarReparto />} />
        <Route path="resumen" element={<ResumenDia />} />
      </Route>

      <Route
        path="/panadero"
        element={
          <ProtectedRoute roles={['panadero']}>
            <MobileLayout navItems={panaderoNav} title="Panadero" />
          </ProtectedRoute>
        }
      >
        <Route index element={<NuevoDespacho />} />
        <Route path="pan-rallado" element={<PanRallado />} />
        <Route path="historial" element={<Historial />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="productos" element={<Productos />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="disputas" element={<Disputas />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
