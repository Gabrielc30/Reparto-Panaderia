import type { InputHTMLAttributes } from 'react'

export function TextField({
  label,
  className = '',
  id,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={fieldId} className="block">
      <span className={`mb-1.5 block text-[15px] font-semibold ${error ? 'text-red-600' : 'text-brand-900'}`}>
        {label}
      </span>
      <input
        id={fieldId}
        className={`h-14 w-full rounded-[10px] border-2 bg-white px-4 text-lg font-semibold text-brand-900 ${
          error ? 'border-red-500 bg-red-50' : 'border-brand-900'
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}
