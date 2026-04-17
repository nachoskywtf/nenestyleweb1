# Configuración de Supabase para Sincronización en Tiempo Real

## Paso 1: Crear cuenta en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto llamado "nicoke-scheduler"

## Paso 2: Configurar Variables de Entorno

1. En tu proyecto Supabase, ve a Settings → API
2. Copia los siguientes valores:
   - Project URL (ej: https://xxxxxxxxxxxx.supabase.co)
   - anon public key (ej: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

3. En tu proyecto local, crea o actualiza el archivo `.env`:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

4. En Vercel, agrega estas variables de entorno en Settings → Environment Variables

## Paso 3: Crear Tablas en la Base de Datos

En el Supabase SQL Editor, ejecuta:

```sql
-- Tabla de Reservas
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  service TEXT NOT NULL,
  date TEXT NOT NULL, -- Format: YYYY-MM-DD
  time TEXT NOT NULL, -- Format: HH:MM
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Disponibilidad
CREATE TABLE availability (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL, -- Format: YYYY-MM-DD
  time TEXT NOT NULL, -- Format: HH:MM
  status TEXT NOT NULL CHECK (status IN ('available', 'booked', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_availability_date ON availability(date);
CREATE INDEX idx_availability_status ON availability(status);
```

## Paso 4: Habilitar Realtime

1. En Supabase, ve a Database → Replication
2. Activa "Realtime" para las tablas:
   - bookings
   - availability

3. O ejecuta este SQL:
```sql
alter publication supabase_realtime add table bookings;
alter publication supabase_realtime add table availability;
```

## Paso 5: Configurar Row Level Security (RLS) - Opcional

Para mayor seguridad, puedes habilitar RLS:

```sql
-- Habilitar RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Public read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public read availability" ON availability FOR SELECT USING (true);

-- Permitir inserción pública
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert availability" ON availability FOR INSERT WITH CHECK (true);

-- Permitir actualización pública
CREATE POLICY "Public update bookings" ON bookings FOR UPDATE USING (true);
CREATE POLICY "Public update availability" ON availability FOR UPDATE USING (true);

-- Permitir eliminación pública
CREATE POLICY "Public delete bookings" ON bookings FOR DELETE USING (true);
CREATE POLICY "Public delete availability" ON availability FOR DELETE USING (true);
```

## Paso 6: Verificar Configuración

1. Actualiza el archivo `src/supabase.ts` con tus credenciales
2. Ejecuta el proyecto localmente: `npm run dev`
3. Intenta hacer una reserva
4. Verifica en Supabase Dashboard → Table Editor que los datos se guarden correctamente

## Paso 7: Prueba de Sincronización en Tiempo Real

1. Abre la aplicación en dos navegadores diferentes
2. En uno, haz una reserva
3. En el otro, verifica que la reserva aparezca automáticamente sin recargar

## Solución de Problemas

**Error: "Connection refused"**
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que el proyecto Supabase esté activo

**Error: "Realtime subscription failed"**
- Verifica que Realtime esté habilitado para las tablas
- Verifica las políticas RLS si están habilitadas

**Las reservas no se sincronizan**
- Verifica que el navegador tenga conexión a internet
- Revisa la consola del navegador para errores de conexión
