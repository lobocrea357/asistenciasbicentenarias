# Changelog - Asistencias Bicentenarias

## [2026-04-05] - Fix: Cambio de estatus en modal de Hermanos

### Problema

El botón `Cambiar Estatus` abría el modal, pero la actualización estaba apuntando a `brothers.status`, campo que no corresponde al esquema actual.

### Causa

En el esquema actual, el estatus del usuario se maneja en `profiles.state_id`, relacionado con `users_status.id` y enlazado al hermano por `brothers.user_id`.

### Solución

- Se cambió la actualización a:
  - Tabla destino: `profiles`
  - Campo actualizado: `state_id`
  - Filtro: `profiles.id = brothers.user_id`
- Se agregaron validaciones en el flujo:
  - Si no existe el estatus seleccionado en `users_status`.
  - Si el hermano no tiene `user_id` asociado.
- El selector del modal ahora carga opciones dinámicas desde `users_status`.

### Resultado

El modal de `Cambiar Estatus` ahora persiste correctamente el nuevo estatus según el modelo real de la base de datos.

## [2026-04-05] - Fix: Supabase RLS (Row Level Security) - Empty Data Response

### Problema

Las consultas a Supabase retornaban arrays vacíos (`[]`) con status `200 OK`, sin mostrar ningún error. Esto afectaba todas las tablas: `meetings`, `brothers`, `attendances` y `temples`.

### Causa

**Row Level Security (RLS)** estaba habilitado en las tablas de Supabase pero no existían políticas (policies) que permitieran lectura/escritura para el rol `anon`. Supabase no lanza error en este caso, simplemente retorna un array vacío.

### Solución

Ejecutar las siguientes sentencias SQL en el **SQL Editor** del dashboard de Supabase:

#### 1. Políticas de lectura (SELECT)

```sql
CREATE POLICY "Allow anonymous read access"
ON public.meetings FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access"
ON public.brothers FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access"
ON public.attendances FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access"
ON public.temples FOR SELECT USING (true);
```

#### 2. Políticas de escritura (INSERT/UPDATE/DELETE)

```sql
-- Meetings
CREATE POLICY "Allow anonymous insert" ON public.meetings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.meetings FOR UPDATE USING (true);

-- Attendances
CREATE POLICY "Allow anonymous insert" ON public.attendances FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete" ON public.attendances FOR DELETE USING (true);
```

#### Alternativa: Deshabilitar RLS (solo para apps privadas/internas)

```sql
ALTER TABLE public.meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brothers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.temples DISABLE ROW LEVEL SECURITY;
```

### Verificación

Para comprobar qué tablas tienen RLS habilitado:

```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

### Nota para colaboradores

Si al conectar con Supabase las consultas retornan datos vacíos sin error, lo primero a revisar son las **políticas de RLS** en el dashboard de Supabase → **Authentication** → **Policies**.
