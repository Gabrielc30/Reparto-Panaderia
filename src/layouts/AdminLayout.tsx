import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { SyncStatus } from '../components/SyncStatus'
import { ThemeToggle } from '../components/ThemeToggle'
import {
  IconAlertTriangle,
  IconBars,
  IconBox,
  IconBread,
  IconClock,
  IconDocument,
  IconFactory,
  IconTrendingUp,
  IconTruck,
  IconUsers,
} from '../components/icons'

const pageItems = [
  { to: '/admin', label: 'Hoy', icon: <IconBars />, end: true },
  { to: '/admin/clientes', label: 'Clientes', icon: <IconDocument /> },
  { to: '/admin/productos', label: 'Productos', icon: <IconBox /> },
  { to: '/admin/insumos', label: 'Insumos', icon: <IconBread /> },
  { to: '/admin/usuarios', label: 'Usuarios', icon: <IconUsers /> },
  { to: '/admin/disputas', label: 'Disputas', icon: <IconAlertTriangle /> },
  { to: '/admin/reportes', label: 'Reportes', icon: <IconTrendingUp /> },
  { to: '/admin/turnos', label: 'Turnos de producción', icon: <IconClock /> },
]

const shortcutItems = [
  { to: '/repartidor/cargar', label: 'Cargar venta (reparto)', icon: <IconTruck /> },
  { to: '/panadero/produccion', label: 'Producción', icon: <IconFactory /> },
]

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-brand-50">
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 transform flex flex-col bg-side text-side-ink transition-transform md:static md:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 pb-3 pt-6">
          <p className="text-[22px] font-extrabold tracking-tight text-white" style={{ color: '#fff' }}>Repartos</p>
          <p className="text-sm text-side-mute">Panel de administración</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          <p className="px-3 pb-1.5 pt-2 text-sm font-semibold text-side-mute">Páginas</p>
          {pageItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-lg px-3 text-base font-semibold [&>svg]:h-[18px] [&>svg]:w-[18px] ${
                  isActive ? 'bg-side-on text-side-on-ink' : 'text-side-ink hover:bg-side-on/40'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          <p className="px-3 pb-1.5 pt-4 text-sm font-semibold text-side-mute">Atajos</p>
          {shortcutItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-base font-semibold text-side-ink hover:bg-side-on/40 [&>svg]:h-[18px] [&>svg]:w-[18px]"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex p-3">
          <ThemeToggle variant="switch" />
        </div>
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b-2 border-brand-100 bg-white px-4 py-3">
          <button
            aria-label="Abrir menú"
            className="grid h-11 w-11 place-items-center rounded-lg text-xl text-brand-900 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <SyncStatus />
            <span className="text-base font-semibold text-brand-900">{profile?.nombre}</span>
            <button
              onClick={() => void signOut()}
              className="text-sm font-medium text-brand-700 underline"
            >
              Salir
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
