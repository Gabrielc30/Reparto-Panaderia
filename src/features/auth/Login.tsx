import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/Button'
import { TextField } from '../../components/TextField'
import { Card } from '../../components/Card'

export function Login() {
  const { session, profile, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  if (session && profile) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) setFormError('Email o contraseña incorrectos.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-brand-900">Repartos Panadería</h1>
        <p className="mb-6 text-center text-sm text-brand-500">Ingresá con tu cuenta</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
