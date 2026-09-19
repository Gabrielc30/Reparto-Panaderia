import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-lg bg-white p-4 ring-1 ring-brand-100 ${className}`} {...props} />
}
