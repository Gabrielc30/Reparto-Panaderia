# Repartos Panadería

PWA para gestionar ventas y cambios de pan en reparto, despachos, conversión a pan rallado, cuentas corrientes y reportes. React + Vite + TypeScript + Tailwind, con Supabase (Postgres + Auth + Edge Functions) como backend y soporte offline vía IndexedDB.

## Setup local

```bash
npm install
cp .env.example .env.local   # completar con las keys del proyecto Supabase
npm run dev
```

Variables de entorno (`.env.local`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Estructura

- `src/lib` — cliente Supabase, IndexedDB (`db.ts`), cola de sincronización offline (`syncManager.ts`).
- `src/auth` — contexto de sesión/perfil y `ProtectedRoute` por rol.
- `src/layouts` — `MobileLayout` (repartidor/panadero) y `AdminLayout` (desktop).
- `src/features/{repartidor,panadero,admin,auth}` — pantallas por rol.
- `supabase/functions` — Edge Functions desplegadas (ver abajo).

## Roles

`admin`, `panadero`, `repartidor` — definidos en `public.users.rol`. No hay alta pública: el admin crea usuarios desde **Usuarios**, que invoca la Edge Function `crear-usuario` (usa `service_role` para crear el `auth.users` + su fila en `public.users`).

## Edge Functions

Desplegadas en el proyecto Supabase (`supabase/functions/*`):

- `confirmar-despacho` — repartidor confirma/objeta cantidades del despacho del día.
- `resolver-disputa` — admin marca una disputa como resuelta.
- `cerrar-dia-repartidor` — valida que no haya disputas abiertas antes de cerrar el día.
- `conversion-pan-rallado` — valida stock y aplica la conversión de forma atómica (llama a la función SQL `aplicar_conversion_pan_rallado`).
- `crear-usuario` — alta de usuarios (admin).

**Convención de nombres de productos `insumo_interno`**: `conversion-pan-rallado` busca los productos por nombre (case-insensitive) que contengan "viejo", "suelto" y "rallado" respectivamente. Al cargar el catálogo, nombrarlos de forma que incluyan esas palabras (ej. "Pan viejo (bolsas)", "Pan suelto", "Pan rallado").

## Offline

Repartidor y panadero pueden cargar datos sin conexión: las escrituras se guardan en una cola en IndexedDB (`src/lib/db.ts`) y se sincronizan automáticamente al recuperar conexión (`src/lib/syncManager.ts`). El estado se muestra en el badge de sincronización del header.

## Deploy

Push a `main` dispara el deploy automático en Vercel (proyecto `reparto-panaderia` ya vinculado). Configurar las mismas variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en Vercel → Settings → Environment Variables.
