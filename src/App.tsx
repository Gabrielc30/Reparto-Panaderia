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
import { Produccion } from './features/panadero/Produccion'
import { NuevaProduccion } from './features/panadero/NuevaProduccion'
import { ResultadoProduccion } from './features/panadero/ResultadoProduccion'

import { Dashboard } from './features/admin/Dashboard'
import { Clientes } from './features/admin/Clientes'
import { Insumos, Productos } from './features/admin/Productos'
import { Usuarios } from './features/admin/Usuarios'
import { Disputas } from './features/admin/Disputas'
import { Reportes } from './features/admin/Reportes'
import { Turnos } from './features/admin/Turnos'
import { IconBox, IconBread, IconCalendar, IconClock, IconDocument, IconFactory } from './components/icons'

const repartidorNav = [
  { to: '/repartidor', label: 'Despacho', icon: <IconBox /> },
  { to: '/repartidor/cargar', label: 'Cargar', icon: <IconDocument /> },
  { to: '/repartidor/resumen', label: 'Resumen', icon: <IconCalendar /> },
]

const panaderoNav = [
  { to: '/panadero', label: 'Despacho', icon: <IconBox /> },
  { to: '/panadero/produccion', label: 'Producción', icon: <IconFactory /> },
  { to: '/panadero/pan-rallado', label: 'Pan rallado', icon: <IconBread /> },
  { to: '/panadero/historial', label: 'Historial', icon: <IconClock /> },
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
          <ProtectedRoute roles={['repartidor', 'admin']}>
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
          <ProtectedRoute roles={['panadero', 'admin']}>
            <MobileLayout navItems={panaderoNav} title="Panadero" />
          </ProtectedRoute>
        }
      >
        <Route index element={<NuevoDespacho />} />
        <Route path="produccion" element={<Produccion />} />
        <Route path="produccion/nueva" element={<NuevaProduccion />} />
        <Route path="produccion/:id/resultado" element={<ResultadoProduccion />} />
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
        <Route path="insumos" element={<Insumos />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="disputas" element={<Disputas />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="turnos" element={<Turnos />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
