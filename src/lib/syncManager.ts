import { supabase } from './supabaseClient'
import { describeFunctionError } from './functionError'
import {
  enqueue,
  getPendingCount,
  getPendingItems,
  markQueueItemError,
  removeQueueItem,
  type QueueItem,
  type QueueType,
} from './db'

type Handler = (payload: unknown) => Promise<void>

function toError(err: unknown): Error {
  if (err instanceof Error) return err
  if (err && typeof err === 'object' && 'message' in err) {
    return new Error(String((err as { message: unknown }).message))
  }
  return new Error('Error desconocido')
}

async function invokeEdgeFunction(name: string, body: unknown) {
  const { error } = await supabase.functions.invoke(name, { body: body as Record<string, unknown> })
  if (error) throw new Error(await describeFunctionError(error))
}

const handlers: Record<QueueType, Handler> = {
  confirmar_despacho: (payload) => invokeEdgeFunction('confirmar-despacho', payload),
  cerrar_dia: (payload) => invokeEdgeFunction('cerrar-dia-repartidor', payload),
  conversion_pan_rallado: (payload) => invokeEdgeFunction('conversion-pan-rallado', payload),

  cargar_reparto: async (payload) => {
    const p = payload as {
      delivery: Record<string, unknown>
      items: Record<string, unknown>[]
      pago?: Record<string, unknown>
    }
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert(p.delivery as never)
      .select('id')
      .single()
    if (deliveryError) throw toError(deliveryError)

    const items = p.items.map((item) => ({ ...item, delivery_id: delivery.id }))
    const { error: itemsError } = await supabase.from('delivery_items').insert(items as never)
    if (itemsError) {
      // roll back the header so a rejected sale doesn't leave an empty delivery behind
      await supabase.from('deliveries').delete().eq('id', delivery.id)
      throw toError(itemsError)
    }

    if (p.pago) {
      const { error: pagoError } = await supabase.from('payments').insert(p.pago as never)
      if (pagoError) throw toError(pagoError)
    }
  },

  registrar_pago: async (payload) => {
    const { error } = await supabase.from('payments').insert(payload as never)
    if (error) throw toError(error)
  },

  nuevo_despacho: async (payload) => {
    const p = payload as { dispatch: Record<string, unknown>; items: Record<string, unknown>[] }
    const { data: dispatch, error: dispatchError } = await supabase
      .from('dispatches')
      .insert(p.dispatch as never)
      .select('id')
      .single()
    if (dispatchError) throw toError(dispatchError)

    const items = p.items.map((item) => ({ ...item, dispatch_id: dispatch.id }))
    const { error: itemsError } = await supabase.from('dispatch_items').insert(items as never)
    if (itemsError) {
      await supabase.from('dispatches').delete().eq('id', dispatch.id)
      throw toError(itemsError)
    }
  },

  nuevo_despacho_local: async (payload) => {
    const { error } = await supabase.from('local_dispatches').insert(payload as never)
    if (error) throw toError(error)
  },
}

type Listener = (pendingCount: number) => void
const listeners = new Set<Listener>()
let flushing = false

async function notify() {
  const count = await getPendingCount()
  for (const listener of listeners) listener(count)
}

export function subscribeSyncStatus(listener: Listener) {
  listeners.add(listener)
  notify()
  return () => {
    listeners.delete(listener)
  }
}

export interface MutationResult {
  ok: boolean
  /** true if the write is still sitting in the offline queue (either because we're offline, or it failed and will retry) */
  queued: boolean
  error?: string
}

export async function queueMutation(type: QueueType, payload: unknown): Promise<MutationResult> {
  const id = await enqueue(type, payload)
  await notify()

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { ok: true, queued: true }
  }

  try {
    await handlers[type](payload)
    await removeQueueItem(id)
    await notify()
    return { ok: true, queued: false }
  } catch (err) {
    const message = toError(err).message
    await markQueueItemError(id, message, 1)
    await notify()
    return { ok: false, queued: true, error: message }
  } finally {
    void flushQueue()
  }
}

export async function flushQueue() {
  if (flushing) return
  if (typeof navigator !== 'undefined' && !navigator.onLine) return
  flushing = true
  try {
    const items = await getPendingItems()
    for (const item of items) {
      await processItem(item)
    }
  } finally {
    flushing = false
    await notify()
  }
}

async function processItem(item: QueueItem) {
  const handler = handlers[item.type]
  try {
    await handler(item.payload)
    if (item.id != null) await removeQueueItem(item.id)
  } catch (err) {
    const message = toError(err).message
    if (item.id != null) await markQueueItemError(item.id, message, item.attempts + 1)
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flushQueue())
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void flushQueue()
  })
  void flushQueue()
}
