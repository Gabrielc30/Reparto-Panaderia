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
      <span className="mb-1.5 block text-[15px] font-semibold text-brand-900">{label}</span>
      <select
        id={fieldId}
        className={`h-14 w-full rounded-[10px] border-2 border-brand-900 bg-white px-4 text-lg font-semibold text-brand-900 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}
