// supabase-js's functions.invoke() rejects non-2xx responses with a generic
// "Edge Function returned a non-2xx status code" error and puts the real
// response on `error.context`. This pulls out the actual `{ error }` body
// our functions send back, so the UI can show what really went wrong.
export async function describeFunctionError(error: unknown): Promise<string> {
  if (error && typeof error === 'object' && 'context' in error) {
    const context = (error as { context: unknown }).context
    if (context instanceof Response) {
      try {
        const body = await context.clone().json()
        if (body && typeof body.error === 'string') return body.error
      } catch {
        // response wasn't JSON, fall through to the generic message
      }
    }
  }
  if (error instanceof Error) return error.message
  return 'Error desconocido'
}
