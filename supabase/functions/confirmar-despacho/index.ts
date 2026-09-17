import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const authHeader = req.headers.get("Authorization") ?? ""

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData.user) return json({ error: "No autenticado" }, 401)

    const { data: profile, error: profileError } = await userClient
      .from("users")
      .select("*")
      .eq("id", userData.user.id)
      .single()
    if (profileError || !profile) return json({ error: "Perfil no encontrado" }, 403)
    if (profile.rol !== "repartidor") return json({ error: "Solo el repartidor puede confirmar" }, 403)

    const body = await req.json()
    const { dispatch_id, comentario_repartidor, items } = body as {
      dispatch_id: string
      comentario_repartidor: string | null
      items: { id: string; cantidad_confirmada_repartidor: number }[]
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: dispatch, error: dispatchError } = await admin
      .from("dispatches")
      .select("*, dispatch_items(*)")
      .eq("id", dispatch_id)
      .single()
    if (dispatchError || !dispatch) return json({ error: "Despacho no encontrado" }, 404)
    if (dispatch.repartidor_id !== profile.id) return json({ error: "Este despacho no es tuyo" }, 403)
    if (dispatch.estado !== "pendiente") return json({ error: "El despacho ya fue procesado" }, 409)

    for (const item of items) {
      const { error } = await admin
        .from("dispatch_items")
        .update({ cantidad_confirmada_repartidor: item.cantidad_confirmada_repartidor })
        .eq("id", item.id)
        .eq("dispatch_id", dispatch_id)
      if (error) return json({ error: error.message }, 500)
    }

    const hayDiferencias = dispatch.dispatch_items.some((original: { id: string; cantidad_despachada_panadero: number }) => {
      const confirmado = items.find((i) => i.id === original.id)?.cantidad_confirmada_repartidor
      return confirmado !== original.cantidad_despachada_panadero
    })

    const nuevoEstado = hayDiferencias ? "en_disputa" : "confirmado"
    const { error: updateError } = await admin
      .from("dispatches")
      .update({
        estado: nuevoEstado,
        comentario_repartidor: comentario_repartidor ?? null,
        fecha_confirmacion: new Date().toISOString(),
      })
      .eq("id", dispatch_id)
    if (updateError) return json({ error: updateError.message }, 500)

    return json({ estado: nuevoEstado })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Error inesperado" }, 500)
  }
})
