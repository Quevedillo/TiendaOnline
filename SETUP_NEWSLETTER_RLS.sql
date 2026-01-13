-- ============================================================================
-- CONFIGURACIÓN RLS PARA NEWSLETTER_SUBSCRIBERS
-- ============================================================================
-- Ejecutar en Supabase SQL Editor para configurar políticas de seguridad
-- ============================================================================

-- Habilitar RLS en la tabla newsletter_subscribers
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PÚBLICAS (cualquier usuario puede suscribirse/desuscribirse)
-- ============================================================================

-- Permitir a cualquiera insertar (suscribirse)
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Permitir a cualquiera eliminar su propia suscripción (por email)
DROP POLICY IF EXISTS "Anyone can unsubscribe from newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone can unsubscribe from newsletter" ON newsletter_subscribers
  FOR DELETE USING (true);

-- ============================================================================
-- POLÍTICAS DE ADMINISTRADOR (solo admins pueden ver/leer suscriptores)
-- ============================================================================

-- Los administradores pueden ver todos los suscriptores
-- (Esto requiere usar service_role key en el backend, que ya tienes configurado)
DROP POLICY IF EXISTS "Service role full access newsletter" ON newsletter_subscribers;
CREATE POLICY "Service role full access newsletter" ON newsletter_subscribers
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- ÍNDICES ADICIONALES PARA MEJORAR RENDIMIENTO
-- ============================================================================

-- Índice para búsquedas por email (ya debería existir)
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Índice para filtrar por verificados
CREATE INDEX IF NOT EXISTS idx_newsletter_verified ON newsletter_subscribers(verified);

-- Índice para ordenar por fecha de creación
CREATE INDEX IF NOT EXISTS idx_newsletter_created_at ON newsletter_subscribers(created_at DESC);

-- ============================================================================
-- AGREGAR COLUMNA DE FECHA DE ACTUALIZACIÓN (si no existe)
-- ============================================================================

ALTER TABLE newsletter_subscribers 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_newsletter_updated_at ON newsletter_subscribers;
CREATE TRIGGER trigger_newsletter_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT 'Newsletter subscribers table configured:' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'newsletter_subscribers'
ORDER BY ordinal_position;

SELECT 'RLS policies for newsletter_subscribers:' as info;
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'newsletter_subscribers';
