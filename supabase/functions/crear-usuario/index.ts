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
    if (profile.rol !== "admin") return json({ error: "Solo el admin puede crear usuarios" }, 403)

    const body = (await req.json()) as {
      panaderia_id: string
      nombre: string
      email: string
      password: string
      rol: "admin" | "panadero" | "repartidor"
      telefono: string | null
      zona_asignada: string | null
    }

    if (body.panaderia_id !== profile.panaderia_id) return json({ error: "No autorizado" }, 403)
    if (!body.email || !body.password || !body.nombre) {
      return json({ error: "Faltan datos obligatorios" }, 400)
    }

    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    })
    if (createError || !created.user) {
      return json({ error: createError?.message ?? "No se pudo crear el usuario" }, 400)
    }

    const { error: insertError } = await admin.from("users").insert({
      id: created.user.id,
      panaderia_id: body.panaderia_id,
      nombre: body.nombre,
      email: body.email,
      rol: body.rol,
      telefono: body.telefono,
      zona_asignada: body.zona_asignada,
      estado: "activo",
    })

    if (insertError) {
      await admin.auth.admin.deleteUser(created.user.id)
      return json({ error: insertError.message }, 500)
    }

    return json({ id: created.user.id })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Error inesperado" }, 500)
  }
})
