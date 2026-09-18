import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { SyncStatus } from '../components/SyncStatus'

interface NavItem {
  to: string
  label: string
  icon: string
}

export function MobileLayout({ navItems, title }: { navItems: NavItem[]; title: string }) {
  const { profile, signOut } = useAuth()

  return (
    <div className="flex h-screen flex-col bg-brand-50">
      <header className="flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3">
        <div>
          <p className="text-xs text-brand-500">{title}</p>
          <p className="font-semibold text-brand-900">{profile?.nombre}</p>
        </div>
        <div className="flex items-center gap-3">
          <SyncStatus />
          {profile?.rol === 'admin' && (
            <Link to="/admin" className="text-sm font-medium text-brand-700 underline">
              Admin
            </Link>
          )}
          <button
            onClick={() => void signOut()}
            className="text-sm font-medium text-brand-700 underline"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 flex border-t border-brand-100 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium ${
                isActive ? 'text-brand-700' : 'text-brand-500/60'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
