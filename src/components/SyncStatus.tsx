import { useSyncStatus } from '../hooks/useSyncStatus'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { Badge } from './Badge'

export function SyncStatus() {
  const online = useOnlineStatus()
  const { pendingCount } = useSyncStatus()

  if (!online) return <Badge tone="danger">Sin conexión</Badge>
  if (pendingCount > 0) return <Badge tone="warning">Sincronizando ({pendingCount})</Badge>
  return <Badge tone="success">Al día</Badge>
}
