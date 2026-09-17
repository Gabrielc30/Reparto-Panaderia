import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white active:bg-brand-900 disabled:bg-brand-100 disabled:text-brand-500',
  secondary: 'bg-white text-brand-700 border-2 border-brand-700 active:bg-brand-50',
  danger: 'bg-red-600 text-white active:bg-red-800 disabled:bg-red-200',
  ghost: 'bg-transparent text-brand-700 active:bg-brand-100',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`w-full rounded-xl px-4 py-4 text-lg font-semibold shadow-sm transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
