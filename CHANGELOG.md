# Changelog - Asistencias Bicentenarias

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
