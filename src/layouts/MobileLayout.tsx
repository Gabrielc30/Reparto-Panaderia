import type { ReactNode } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { SyncStatus } from '../components/SyncStatus'
import { ThemeToggle } from '../components/ThemeToggle'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

export function MobileLayout({ navItems, title }: { navItems: NavItem[]; title: string }) {
  const { profile, signOut } = useAuth()

  return (
    <div className="flex h-screen flex-col bg-brand-50">
      <header className="flex items-center justify-between gap-2 border-b-2 border-brand-100 bg-white px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm text-brand-500">{title}</p>
          <p className="truncate text-lg font-bold leading-tight text-brand-900">{profile?.nombre}</p>
        </div>
        <div className="flex items-center gap-2">
          <SyncStatus />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <Outlet />
        <div className="mt-6 flex items-center justify-center gap-6">
          {profile?.rol === 'admin' && (
            <Link to="/admin" className="flex min-h-11 items-center text-sm font-semibold text-brand-700 underline">
              Ir al panel de admin
            </Link>
          )}
          <button
            onClick={() => void signOut()}
            className="min-h-11 text-sm font-semibold text-brand-700 underline"
          >
            Salir
          </button>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 flex border-t-2 border-brand-100 bg-white">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-16 flex-1 flex-col items-center justify-center gap-1 py-2 text-sm font-semibold ${
                isActive ? 'text-brand-700' : 'text-brand-500'
              }`
            }
          >
            <span className="text-xl [&>svg]:h-6 [&>svg]:w-6">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
