import { useTheme } from '../lib/theme'

export function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'switch' }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  if (variant === 'switch') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        onClick={toggle}
        className="mt-auto flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border-2 border-side-mute px-3 text-base font-semibold text-side-ink"
      >
        Modo noche
        <span className={`relative h-6 w-11 flex-shrink-0 rounded-full ${dark ? 'bg-brand-700' : 'bg-side-mute'}`}>
          <span
            className={`absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-transform ${
              dark ? 'translate-x-5' : ''
            }`}
            style={{ backgroundColor: '#fff' }}
          />
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo noche'}
      aria-pressed={dark}
      className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[10px] border-2 border-brand-900 text-brand-900"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor" />
      </svg>
    </button>
  )
}
