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

    const { data: profile } = await userClient.from("users").select("*").eq("id", userData.user.id).single()
    if (!profile) return json({ error: "Perfil no encontrado" }, 403)
    if (profile.rol !== "admin") return json({ error: "Solo el admin puede resolver disputas" }, 403)

    const { dispatch_id, comentario_admin } = (await req.json()) as {
      dispatch_id: string
      comentario_admin: string
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: dispatch, error: dispatchError } = await admin
      .from("dispatches")
      .select("*")
      .eq("id", dispatch_id)
      .single()
    if (dispatchError || !dispatch) return json({ error: "Despacho no encontrado" }, 404)
    if (dispatch.panaderia_id !== profile.panaderia_id) return json({ error: "No autorizado" }, 403)
    if (dispatch.estado !== "en_disputa") return json({ error: "El despacho no está en disputa" }, 409)

    const { error: updateError } = await admin
      .from("dispatches")
      .update({
        estado: "resuelto",
        comentario_admin,
        fecha_resolucion: new Date().toISOString(),
      })
      .eq("id", dispatch_id)
    if (updateError) return json({ error: updateError.message }, 500)

    return json({ estado: "resuelto" })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Error inesperado" }, 500)
  }
})
