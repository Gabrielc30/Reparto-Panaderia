import type { SelectHTMLAttributes } from 'react'

export function SelectField({
  label,
  className = '',
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-1 block text-sm font-medium text-brand-900">{label}</span>
      <select
        id={fieldId}
        className={`w-full rounded-xl border-2 border-brand-100 bg-white px-4 py-3 text-base text-brand-900 focus:border-brand-500 focus:outline-none ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}
