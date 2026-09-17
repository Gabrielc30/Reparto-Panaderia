import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export type QueueType =
  | 'confirmar_despacho'
  | 'cargar_reparto'
  | 'registrar_pago'
  | 'cerrar_dia'
  | 'nuevo_despacho'
  | 'nuevo_despacho_local'
  | 'conversion_pan_rallado'

export interface QueueItem {
  id?: number
  type: QueueType
  payload: unknown
  created_at: string
  status: 'pending' | 'error'
  error?: string
  attempts: number
}

interface AppDB extends DBSchema {
  sync_queue: {
    key: number
    value: QueueItem
    indexes: { 'by-status': string }
  }
  cache: {
    key: string
    value: { key: string; data: unknown; updated_at: string }
  }
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>('reparto-panaderia', 1, {
      upgrade(db) {
        const queueStore = db.createObjectStore('sync_queue', {
          keyPath: 'id',
          autoIncrement: true,
        })
        queueStore.createIndex('by-status', 'status')
        db.createObjectStore('cache', { keyPath: 'key' })
      },
    })
  }
  return dbPromise
}

export async function enqueue(type: QueueType, payload: unknown) {
  const db = await getDb()
  return db.add('sync_queue', {
    type,
    payload,
    created_at: new Date().toISOString(),
    status: 'pending',
    attempts: 0,
  })
}

export async function getPendingItems() {
  const db = await getDb()
  return db.getAllFromIndex('sync_queue', 'by-status', 'pending')
}

export async function getPendingCount() {
  const db = await getDb()
  return db.countFromIndex('sync_queue', 'by-status', 'pending')
}

export async function removeQueueItem(id: number) {
  const db = await getDb()
  return db.delete('sync_queue', id)
}

export async function markQueueItemError(id: number, error: string, attempts: number) {
  const db = await getDb()
  const item = await db.get('sync_queue', id)
  if (!item) return
  item.status = 'error'
  item.error = error
  item.attempts = attempts
  await db.put('sync_queue', item)
}

export async function retryErroredItems() {
  const db = await getDb()
  const errored = await db.getAllFromIndex('sync_queue', 'by-status', 'error')
  for (const item of errored) {
    item.status = 'pending'
    await db.put('sync_queue', item)
  }
}

export async function setCache<T>(key: string, data: T) {
  const db = await getDb()
  await db.put('cache', { key, data, updated_at: new Date().toISOString() })
}

export async function getCache<T>(key: string): Promise<T | undefined> {
  const db = await getDb()
  const row = await db.get('cache', key)
  return row?.data as T | undefined
}
