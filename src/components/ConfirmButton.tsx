import { useState } from 'react'
import { Button } from './Button'

interface ConfirmButtonProps {
  label: string
  confirmLabel: string
  message: string
  onConfirm: () => void
  disabled?: boolean
}

export function ConfirmButton({ label, confirmLabel, message, onConfirm, disabled }: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-brand-700">{message}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirming(false)
              onConfirm()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button onClick={() => setConfirming(true)} disabled={disabled}>
      {label}
    </Button>
  )
}
