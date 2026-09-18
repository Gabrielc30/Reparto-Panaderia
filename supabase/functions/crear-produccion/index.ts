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
    if (profile.rol !== "panadero" && profile.rol !== "admin") {
      return json({ error: "Solo panadero o admin pueden registrar producción" }, 403)
    }

    const body = (await req.json()) as {
      turno_id: string
      fecha: string
      insumos: { producto_id: string; insumo_id: string; cantidad: number; unidad_medida: string }[]
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await admin.rpc("aplicar_nueva_produccion", {
      p_panaderia_id: profile.panaderia_id,
      p_turno_id: body.turno_id,
      p_panadero_id: profile.id,
      p_fecha: body.fecha,
      p_insumos: body.insumos,
    })

    if (error) return json({ error: error.message }, 400)

    return json(data)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Error inesperado" }, 500)
  }
})
