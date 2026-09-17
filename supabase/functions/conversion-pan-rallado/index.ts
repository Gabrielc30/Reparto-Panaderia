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
      return json({ error: "Solo panadero o admin pueden registrar conversiones" }, 403)
    }

    const body = (await req.json()) as {
      panaderia_id: string
      responsable_id: string
      bolsas_viejas_usadas: number
      pan_suelto_usado_kg: number
      pan_rallado_obtenido_kg: number
      observaciones: string | null
    }

    if (body.panaderia_id !== profile.panaderia_id) return json({ error: "No autorizado" }, 403)

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: insumos, error: insumosError } = await admin
      .from("products")
      .select("*")
      .eq("panaderia_id", body.panaderia_id)
      .eq("tipo", "insumo_interno")
    if (insumosError) return json({ error: insumosError.message }, 500)

    const viejo = insumos.find((p) => p.nombre.toLowerCase().includes("viejo"))
    const suelto = insumos.find((p) => p.nombre.toLowerCase().includes("suelto"))
    const rallado = insumos.find((p) => p.nombre.toLowerCase().includes("rallado"))

    if (!viejo || !suelto || !rallado) {
      return json(
        {
          error:
            'No se encontraron los productos insumo_interno esperados (deben incluir "viejo", "suelto" y "rallado" en el nombre).',
        },
        422,
      )
    }

    const { data, error } = await admin.rpc("aplicar_conversion_pan_rallado", {
      p_panaderia_id: body.panaderia_id,
      p_responsable_id: body.responsable_id,
      p_bolsas_viejas_usadas: body.bolsas_viejas_usadas,
      p_pan_suelto_usado_kg: body.pan_suelto_usado_kg,
      p_pan_rallado_obtenido_kg: body.pan_rallado_obtenido_kg,
      p_observaciones: body.observaciones,
      p_producto_viejo_id: viejo.id,
      p_producto_suelto_id: suelto.id,
      p_producto_rallado_id: rallado.id,
    })

    if (error) return json({ error: error.message }, 400)

    return json(data)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Error inesperado" }, 500)
  }
})
