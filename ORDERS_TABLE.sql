-- ============================================================================
-- TABLA DE PEDIDOS (ORDERS) PARA SINCRONIZACIÓN CON STRIPE
-- ============================================================================
-- Ejecuta este script en el SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query
-- ============================================================================

-- Agregar columnas faltantes si la tabla ya existía
DO $$ 
BEGIN
  -- Agregar total_amount si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
    ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
    RAISE NOTICE 'Columna total_amount añadida';
  END IF;

  -- Agregar stripe_session_id si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'stripe_session_id') THEN
    ALTER TABLE orders ADD COLUMN stripe_session_id TEXT UNIQUE;
    RAISE NOTICE 'Columna stripe_session_id añadida';
  END IF;

  -- Agregar stripe_payment_intent_id si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent_id') THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_intent_id TEXT;
    RAISE NOTICE 'Columna stripe_payment_intent_id añadida';
  END IF;

  -- Agregar shipping_name si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'shipping_name') THEN
    ALTER TABLE orders ADD COLUMN shipping_name TEXT;
    RAISE NOTICE 'Columna shipping_name añadida';
  END IF;

  -- Agregar shipping_address si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
    ALTER TABLE orders ADD COLUMN shipping_address JSONB;
    RAISE NOTICE 'Columna shipping_address añadida';
  END IF;

  -- Agregar shipping_phone si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'shipping_phone') THEN
    ALTER TABLE orders ADD COLUMN shipping_phone TEXT;
    RAISE NOTICE 'Columna shipping_phone añadida';
  END IF;

  -- Agregar billing_email si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'billing_email') THEN
    ALTER TABLE orders ADD COLUMN billing_email TEXT;
    RAISE NOTICE 'Columna billing_email añadida';
  END IF;

  -- Agregar items si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'items') THEN
    ALTER TABLE orders ADD COLUMN items JSONB NOT NULL DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Columna items añadida';
  END IF;

  -- Agregar status si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'status') THEN
    ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending';
    RAISE NOTICE 'Columna status añadida';
  END IF;

  -- Agregar created_at si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'created_at') THEN
    ALTER TABLE orders ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Columna created_at añadida';
  END IF;

  -- Agregar updated_at si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'orders' AND column_name = 'updated_at') THEN
    ALTER TABLE orders ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Columna updated_at añadida';
  END IF;

  RAISE NOTICE 'Actualización de tabla completada';
END $$;

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON orders;
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política: usuarios pueden ver solo sus propios pedidos
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuarios pueden insertar sus propios pedidos
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuarios pueden actualizar sus propios pedidos (para cancelar)
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: service role tiene acceso total (para webhooks y admin)
DROP POLICY IF EXISTS "Service role full access" ON orders;
CREATE POLICY "Service role full access" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'orders'
) AS orders_table_exists;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'orders';

-- ============================================================================
-- COMENTARIOS
-- ============================================================================
COMMENT ON TABLE orders IS 'Pedidos sincronizados con Stripe Checkout';
COMMENT ON COLUMN orders.user_id IS 'ID del usuario de Supabase Auth';
COMMENT ON COLUMN orders.stripe_session_id IS 'ID único de la sesión de Stripe Checkout';
COMMENT ON COLUMN orders.items IS 'JSON con los productos del pedido';
COMMENT ON COLUMN orders.total_amount IS 'Monto total en dólares (no cents)';
