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
- `crear-produccion` — panadero/admin cargan insumos de una producción; valida stock y turno activo, descuenta stock de insumos (llama a `aplicar_nueva_produccion`).
- `cargar-resultado-produccion` — cierra una producción con el resultado de cocción, suma stock de productos terminados, bloquea doble carga (llama a `aplicar_resultado_produccion`).

**Convención de nombres de productos `insumo_interno`**: `conversion-pan-rallado` busca los productos por nombre (case-insensitive) que contengan "viejo", "suelto" y "rallado" respectivamente. Al cargar el catálogo, nombrarlos de forma que incluyan esas palabras (ej. "Pan viejo (bolsas)", "Pan suelto", "Pan rallado").

## Producción

Registra la elaboración de productos en dos pasos separados en el tiempo (la cocción no es inmediata):

1. **Nueva producción** (panadero/admin): elige un turno (configurable por panadería en `/admin/turnos`, sin turnos hardcodeados) y fecha, carga uno o más productos a elaborar con los insumos (`materia_prima`) usados en cada uno. Crea `producciones` (`estado='insumos_cargados'`) + `produccion_insumos`, y descuenta stock de cada insumo.
2. **Cargar resultado de cocción** (panadero/admin), desde la lista de producciones pendientes: carga la cantidad obtenida por producto. Crea `produccion_resultados`, pasa `producciones.estado` a `'cocinado'` con `fecha_coccion`, y suma stock de cada producto terminado. Una producción cocinada queda de solo lectura.

`/admin/turnos` es un CRUD simple (RLS ya restringe a admin); el resto pasa por Edge Functions + funciones SQL atómicas por la validación de stock.

## Offline

Repartidor y panadero pueden cargar datos sin conexión: las escrituras se guardan en una cola en IndexedDB (`src/lib/db.ts`) y se sincronizan automáticamente al recuperar conexión (`src/lib/syncManager.ts`). El estado se muestra en el badge de sincronización del header.

## Deploy

Push a `main` dispara el deploy automático en Vercel (proyecto `reparto-panaderia` ya vinculado). Configurar las mismas variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en Vercel → Settings → Environment Variables.
