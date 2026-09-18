interface NumberStepperProps {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  step?: number
  error?: string
}

export function NumberStepper({ label, value, onChange, min = 0, step = 1, error }: NumberStepperProps) {
  return (
    <div>
      {label && <span className="mb-1 block text-sm font-medium text-brand-900">{label}</span>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Restar"
          onClick={() => onChange(Math.max(min, roundStep(value - step, step)))}
          className="h-12 w-12 flex-shrink-0 rounded-xl border-2 border-brand-700 text-xl font-semibold text-brand-700 active:bg-brand-50"
        >
          –
        </button>
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`h-12 flex-1 rounded-xl border-2 bg-white text-center text-lg font-semibold text-brand-900 focus:outline-none ${
            error ? 'border-red-500 bg-red-50' : 'border-brand-100 focus:border-brand-500'
          }`}
        />
        <button
          type="button"
          aria-label="Sumar"
          onClick={() => onChange(roundStep(value + step, step))}
          className="h-12 w-12 flex-shrink-0 rounded-xl bg-brand-700 text-xl font-semibold text-white active:bg-brand-900"
        >
          +
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function roundStep(value: number, step: number) {
  if (!Number.isFinite(value)) return 0
  const decimals = step.toString().split('.')[1]?.length ?? 0
  return Number(value.toFixed(decimals))
}
