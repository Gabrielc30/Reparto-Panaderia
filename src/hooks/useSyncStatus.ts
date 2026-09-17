import { useEffect, useState } from 'react'
import { subscribeSyncStatus } from '../lib/syncManager'

export function useSyncStatus() {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => subscribeSyncStatus(setPendingCount), [])

  return { pendingCount, isSyncing: pendingCount > 0 }
}
