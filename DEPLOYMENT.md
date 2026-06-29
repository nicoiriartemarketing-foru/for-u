# For U: publicacion y Supabase

## Estado actual

- La app principal esta en `frontend/`.
- La app usa Vite + React y se publica como sitio estatico.
- Supabase ya esta conectado en codigo con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` o `VITE_SUPABASE_PUBLISHABLE_KEY`.
- La app guarda los registros del creador en la tabla `digital_world_drafts`.
- La Edge Function `chat` esta desplegada en Supabase y se invoca desde `/ia`.
- Las rutas internas como `/ia`, `/metodologia`, `/editor` y `/p/slug` necesitan fallback a `index.html`. El archivo `frontend/public/.htaccess` ya cubre esto para Hostinger.
- `npm run build` ya genera correctamente `frontend/dist/`.
- El chequeo `npm run typecheck` queda separado porque TypeScript se queda congelado en este entorno incluso revisando solo la configuracion de Vite.

## Antes de subir a GitHub

1. No subir archivos `.env`.
2. Subir `frontend/.env.example`, no `frontend/.env`.
3. No subir `node_modules` ni `dist`.
4. Crear el repositorio en GitHub y subir el proyecto completo.

## Variables que necesita Hostinger

En Hostinger o en el entorno donde se haga el build de `frontend/`:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_PUBLIC_ANON_O_PUBLISHABLE_KEY
```

Tambien sirve `VITE_SUPABASE_PUBLISHABLE_KEY` en lugar de `VITE_SUPABASE_ANON_KEY`. Una variable llamada `SB_PUBLISHABLE_KEY` en la raiz del repo no llega al navegador: Vite solo expone variables con prefijo `VITE_` durante el build.

Nunca publiques `SB_SECRET_KEY` ni service role keys en el frontend.

## Secreto que necesita Supabase para IA real

En Supabase Dashboard > Edge Functions > Secrets, agregar:

```env
GEMINI_API_KEY=TU_GEMINI_API_KEY
```

Ruta exacta: Supabase Dashboard > Edge Functions > Secrets. Tambien se puede configurar por CLI con `supabase secrets set GEMINI_API_KEY=... --project-ref yizkrarmnrwkdrndqdji`.

Sin este secreto, la funcion `chat` responde con `mode: "fallback"` y `fallbackReason: "missing_gemini_key"`. La app mantiene la recomendacion local como respaldo y lo explica en pantalla.

## Build para Hostinger

Desde `frontend/`:

```bash
npm install
npm run build
```

Luego subir el contenido de:

```text
frontend/dist/
```

a `public_html/` en Hostinger.

## Supabase

Aplicar estas migraciones en orden desde el SQL editor de Supabase si todavia no existen:

1. `supabase/migrations/01_b2b_schema.sql`
2. `supabase/migrations/02_digital_world_drafts.sql`
3. `supabase/migrations/03_expand_business_types.sql`

La tabla importante para probar el flujo actual es:

```text
digital_world_drafts
```

Debe tener RLS activo y una policy de INSERT para visitantes. La migracion `02_digital_world_drafts.sql` ya la incluye.

Verificado el 2026-06-22:

- Proyecto Supabase: `for u` (`yizkrarmnrwkdrndqdji`)
- `digital_world_drafts` existe, tiene RLS activo y ya contiene registros.
- Edge Function `chat` existe y responde.
- Falta configurar `GEMINI_API_KEY` como secreto para respuestas reales de Gemini.
- Build de Hostinger verificado con `npm run build`.

Auditoria del 2026-06-28:

- La Edge Function `chat` sigue activa en Supabase, version 2, con `verify_jwt=false`.
- Los logs de Edge Functions de las ultimas 24 horas no muestran invocaciones recientes de `chat`.
- Hay un `.env` en la raiz con `SB_PUBLISHABLE_KEY`, pero esa clave no activa el cliente del sitio. El build de `frontend/` necesita `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` o `VITE_SUPABASE_PUBLISHABLE_KEY`.
- `/ia` ahora distingue en pantalla entre IA en vivo, falta de variables publicas del frontend, falta de `GEMINI_API_KEY` en Supabase y errores temporales de funcion/proveedor.

## Prueba minima despues de publicar

1. Abrir `/register`.
2. Crear una landing.
3. Confirmar que abre `/p/mi-slug`.
4. En Supabase, revisar que se haya insertado una fila en `digital_world_drafts`.
5. Refrescar `/ia`, `/metodologia`, `/editor` y `/p/mi-slug` para confirmar que Hostinger no devuelve 404.
