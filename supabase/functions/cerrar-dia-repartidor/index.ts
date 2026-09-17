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

function todayISO() {
  return new Date().toISOString().slice(0, 10)
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

    const body = (await req.json()) as { repartidor_id: string; fecha?: string }
    const repartidorId = body.repartidor_id
    const fecha = body.fecha ?? todayISO()

    if (profile.rol !== "admin" && profile.id !== repartidorId) {
      return json({ error: "No autorizado" }, 403)
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: disputas, error: disputasError } = await admin
      .from("dispatches")
      .select("id")
      .eq("repartidor_id", repartidorId)
      .eq("fecha", fecha)
      .eq("estado", "en_disputa")
    if (disputasError) return json({ error: disputasError.message }, 500)
    if (disputas.length > 0) {
      return json({ error: "No se puede cerrar el día: hay despachos en disputa sin resolver." }, 409)
    }

    const { data: repartidorProfile } = await admin
      .from("users")
      .select("panaderia_id")
      .eq("id", repartidorId)
      .single()
    if (!repartidorProfile) return json({ error: "Repartidor no encontrado" }, 404)

    const { data: existing } = await admin
      .from("cierre_dia_repartidor")
      .select("id")
      .eq("repartidor_id", repartidorId)
      .eq("fecha", fecha)
      .maybeSingle()

    if (existing) {
      const { error } = await admin
        .from("cierre_dia_repartidor")
        .update({ estado: "cerrado", fecha_cierre: new Date().toISOString(), bloqueado_por_disputa: false })
        .eq("id", existing.id)
      if (error) return json({ error: error.message }, 500)
    } else {
      const { error } = await admin.from("cierre_dia_repartidor").insert({
        panaderia_id: repartidorProfile.panaderia_id,
        repartidor_id: repartidorId,
        fecha,
        estado: "cerrado",
        fecha_cierre: new Date().toISOString(),
      })
      if (error) return json({ error: error.message }, 500)
    }

    return json({ estado: "cerrado" })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Error inesperado" }, 500)
  }
})
