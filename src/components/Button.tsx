import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white active:bg-brand-600 disabled:bg-brand-100 disabled:text-brand-500',
  secondary: 'border-2 border-brand-900 bg-transparent text-brand-900 active:bg-brand-100',
  danger: 'bg-red-600 text-white active:opacity-80 disabled:bg-red-200',
  ghost: 'bg-transparent text-brand-700 active:bg-brand-100',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`min-h-14 w-full rounded-[10px] px-4 text-lg font-bold transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
