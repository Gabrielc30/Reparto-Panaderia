import { useEffect, useState } from 'react'
import { subscribeSyncStatus, type SyncState } from '../lib/syncManager'

const empty: SyncState = { pendingCount: 0, erroredItems: [] }

export function useSyncStatus() {
  const [state, setState] = useState<SyncState>(empty)

  useEffect(() => subscribeSyncStatus(setState), [])

  return { pendingCount: state.pendingCount, erroredItems: state.erroredItems, isSyncing: state.pendingCount > 0 }
}
