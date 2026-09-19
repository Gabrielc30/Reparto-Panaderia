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
      {label && <span className="mb-1.5 block text-[15px] font-semibold text-brand-900">{label}</span>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Restar"
          onClick={() => onChange(Math.max(min, roundStep(value - step, step)))}
          className="h-14 w-14 flex-shrink-0 rounded-[10px] border-2 border-brand-900 text-2xl font-bold text-brand-900 active:bg-brand-100"
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
          className={`h-14 min-w-0 flex-1 rounded-[10px] border-2 bg-white text-center text-xl font-bold text-brand-900 ${
            error ? 'border-red-500 bg-red-50' : 'border-brand-900'
          }`}
        />
        <button
          type="button"
          aria-label="Sumar"
          onClick={() => onChange(roundStep(value + step, step))}
          className="h-14 w-14 flex-shrink-0 rounded-[10px] bg-brand-700 text-2xl font-bold text-white active:bg-brand-600"
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
