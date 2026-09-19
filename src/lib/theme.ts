import { useCallback, useSyncExternalStore } from 'react'

export type ThemeChoice = 'light' | 'dark'

const STORAGE_KEY = 'tema'
const listeners = new Set<() => void>()
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function readStored(): ThemeChoice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

function resolve(): ThemeChoice {
  return readStored() ?? (media?.matches ? 'dark' : 'light')
}

/** Aplica el tema al documento y al color de la barra del navegador. */
export function applyTheme() {
  const stored = readStored()
  const root = document.documentElement
  if (stored) root.setAttribute('data-theme', stored)
  else root.removeAttribute('data-theme')
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim()
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
}

function emit() {
  applyTheme()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  media?.addEventListener('change', emit)
  return () => {
    listeners.delete(listener)
    media?.removeEventListener('change', emit)
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, resolve, () => 'light' as ThemeChoice)
  const toggle = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, resolve() === 'dark' ? 'light' : 'dark')
    } catch {
      /* sin almacenamiento: el cambio dura solo hasta recargar */
    }
    emit()
  }, [])
  return { theme, toggle }
}
