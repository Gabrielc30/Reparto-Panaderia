import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { SyncStatus } from '../components/SyncStatus'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/clientes', label: 'Clientes', icon: '🧾' },
  { to: '/admin/productos', label: 'Productos', icon: '🍞' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: '👥' },
  { to: '/admin/disputas', label: 'Disputas', icon: '⚠️' },
  { to: '/admin/reportes', label: 'Reportes', icon: '📈' },
]

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-brand-50">
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 transform border-r border-brand-100 bg-white transition-transform md:static md:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-brand-100 px-5 py-4">
          <p className="text-lg font-bold text-brand-900">Panadería</p>
          <p className="text-xs text-brand-500">Panel de administración</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-brand-700 text-white' : 'text-brand-700 hover:bg-brand-50'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <div className="my-2 border-t border-brand-100" />
          <Link
            to="/repartidor/cargar"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            <span>🚚</span>
            Cargar venta (reparto)
          </Link>
        </nav>
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3">
          <button
            className="rounded-lg p-2 text-brand-700 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <SyncStatus />
            <span className="text-sm text-brand-900">{profile?.nombre}</span>
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
