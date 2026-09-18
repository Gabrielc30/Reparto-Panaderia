import { useState } from 'react'
import { useSyncStatus } from '../hooks/useSyncStatus'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { Badge } from './Badge'
import { queueTypeLabels, retryAllErrored, retryItem } from '../lib/syncManager'

export function SyncStatus() {
  const online = useOnlineStatus()
  const { pendingCount, erroredItems } = useSyncStatus()
  const [open, setOpen] = useState(false)

  if (!online) return <Badge tone="danger">Sin conexión</Badge>

  if (erroredItems.length > 0) {
    return (
      <div className="relative">
        <button onClick={() => setOpen((v) => !v)} className="cursor-pointer">
          <Badge tone="danger">{erroredItems.length} con error</Badge>
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-brand-100 bg-white p-3 shadow-lg">
              <p className="mb-2 text-sm font-semibold text-brand-900">No se pudieron sincronizar</p>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {erroredItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-red-200 bg-red-50 p-2.5">
                    <p className="text-xs font-semibold text-brand-900">{queueTypeLabels[item.type]}</p>
                    <p className="mt-0.5 text-xs text-red-700">{item.error}</p>
                    <button
                      onClick={() => item.id != null && void retryItem(item.id)}
                      className="mt-2 rounded-lg border-2 border-brand-700 px-3 py-1 text-xs font-semibold text-brand-700"
                    >
                      Reintentar
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => void retryAllErrored()}
                className="mt-3 w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white"
              >
                Reintentar todo
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  if (pendingCount > 0) return <Badge tone="warning">Sincronizando ({pendingCount})</Badge>
  return <Badge tone="success">Al día</Badge>
}
