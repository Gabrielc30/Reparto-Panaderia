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
      <span className={`mb-1 block text-sm font-medium ${error ? 'text-red-600' : 'text-brand-900'}`}>
        {label}
      </span>
      <input
        id={fieldId}
        className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-base text-brand-900 focus:outline-none ${
          error ? 'border-red-500 bg-red-50' : 'border-brand-100 focus:border-brand-500'
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}
