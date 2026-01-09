-- ============================================================================
-- SQL PARA MIGRACIÓN: FashionMarket → ZapatosPremium
-- Ejecutar en Supabase Console (SQL Editor)
-- ============================================================================

-- ============================================================================
-- PASO 1: ACTUALIZAR TABLA CATEGORIES
-- ============================================================================

-- Agregar campos nuevos si no existen
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon VARCHAR,
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Limpiar y repoblar con categorías de zapatos
DELETE FROM categories;

INSERT INTO categories (name, slug, description, icon, display_order) VALUES
('Basketball', 'basketball', 'Zapatos de baloncesto: Jordan, Kyrie, LeBron y más', '🏀', 1),
('Lifestyle', 'lifestyle', 'Sneakers casuales para el día a día: Air Force, Stan Smith, etc.', '👟', 2),
('Running', 'running', 'Zapatillas para correr: Air Max, Ultraboost, Gel-Lyte', '⚡', 3),
('Colecciones Limitadas', 'limited-editions', 'Ediciones limitadas y colaboraciones exclusivas', '✨', 4);

-- ============================================================================
-- PASO 2: CREAR TABLA ACTUALIZADA DE PRODUCTS
-- ============================================================================

-- Opción A: Si la tabla no existe (nuevo proyecto)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  detailed_description JSONB, -- { materials, fit, care_instructions }
  
  -- Precios
  price INTEGER NOT NULL, -- en céntimos
  original_price INTEGER, -- MSRP original
  
  -- Inventario
  stock INTEGER NOT NULL DEFAULT 0,
  sizes_available JSONB, -- { "36": 5, "37": 3, "38": 8 }
  
  -- Categorización
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Datos específicos de zapatos
  brand VARCHAR NOT NULL, -- Jordan, Adidas, Nike, Puma, etc.
  model VARCHAR, -- AJ1, Yeezy 700, etc.
  colorway VARCHAR, -- Red Toe, Bred, Chicago, etc.
  sku VARCHAR UNIQUE NOT NULL,
  
  -- Release info
  release_date DATE,
  is_limited_edition BOOLEAN DEFAULT FALSE,
  release_type VARCHAR DEFAULT 'standard',
  
  -- Tags y contenido
  tags TEXT[] DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_original_price CHECK (original_price IS NULL OR original_price >= price)
);

-- Opción B: Si la tabla ya existe, hacer ALTER (ejecutar SOLO si tienes datos previos)
/*
ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand VARCHAR NOT NULL DEFAULT 'Generic',
ADD COLUMN IF NOT EXISTS model VARCHAR,
ADD COLUMN IF NOT EXISTS colorway VARCHAR,
ADD COLUMN IF NOT EXISTS sku VARCHAR UNIQUE,
ADD COLUMN IF NOT EXISTS release_date DATE,
ADD COLUMN IF NOT EXISTS is_limited_edition BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS release_type VARCHAR DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS detailed_description JSONB,
ADD COLUMN IF NOT EXISTS original_price INTEGER,
ADD COLUMN IF NOT EXISTS sizes_available JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Actualizar constraint
ALTER TABLE products
DROP CONSTRAINT IF NOT EXISTS valid_price,
DROP CONSTRAINT IF NOT EXISTS valid_original_price,
ADD CONSTRAINT valid_price CHECK (price >= 0),
ADD CONSTRAINT valid_original_price CHECK (original_price IS NULL OR original_price >= price);
*/

-- ============================================================================
-- PASO 3: CREAR TABLAS ADICIONALES
-- ============================================================================

-- Tabla de reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de alertas de restock
CREATE TABLE IF NOT EXISTS restock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  notified_at TIMESTAMP,
  UNIQUE(user_id, product_id, size)
);

-- Tabla de órdenes (preparación para checkout)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  total_price INTEGER NOT NULL,
  shipping_address JSONB,
  notes TEXT,
  stripe_payment_id VARCHAR UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de líneas de orden
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price_at_purchase INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PASO 4: CREAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_release_date ON products(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_limited ON products(is_limited_edition);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON restock_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_product ON restock_alerts(product_id);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================================================
-- PASO 5: HABILITAR RLS (Row Level Security)
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 6: CREAR POLÍTICAS RLS
-- ============================================================================

-- PRODUCTOS: Lectura pública
DROP POLICY IF EXISTS "Products are readable by everyone" ON products;
CREATE POLICY "Products are readable by everyone"
  ON products FOR SELECT
  USING (true);

-- PRODUCTOS: Solo admin puede insertar
DROP POLICY IF EXISTS "Only admin can insert products" ON products;
CREATE POLICY "Only admin can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.role = 'service_role'
    )
  );

-- PRODUCTOS: Solo admin puede actualizar
DROP POLICY IF EXISTS "Only admin can update products" ON products;
CREATE POLICY "Only admin can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.role = 'service_role'
    )
  );

-- PRODUCTOS: Solo admin puede eliminar
DROP POLICY IF EXISTS "Only admin can delete products" ON products;
CREATE POLICY "Only admin can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.role = 'service_role'
    )
  );

-- CATEGORÍAS: Lectura pública
DROP POLICY IF EXISTS "Categories readable by all" ON categories;
CREATE POLICY "Categories readable by all"
  ON categories FOR SELECT
  USING (true);

-- REVIEWS: Lectura pública
DROP POLICY IF EXISTS "Reviews readable by all" ON product_reviews;
CREATE POLICY "Reviews readable by all"
  ON product_reviews FOR SELECT
  USING (true);

-- REVIEWS: Usuarios pueden escribir propias reviews
DROP POLICY IF EXISTS "Users can create own reviews" ON product_reviews;
CREATE POLICY "Users can create own reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ALERTAS: Usuarios pueden gestionar propias alertas
DROP POLICY IF EXISTS "Users can manage own alerts" ON restock_alerts;
CREATE POLICY "Users can manage own alerts"
  ON restock_alerts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ÓRDENES: Usuarios ven propias órdenes
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- ÓRDENES: Usuarios pueden crear órdenes
DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ORDER ITEMS: Mismo que órdenes
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PASO 7: DATOS DE EJEMPLO (OPCIONAL)
-- ============================================================================

-- Insertar productos de ejemplo
INSERT INTO products (
  name, slug, description, brand, model, colorway, sku,
  price, original_price, stock,
  category_id, release_date, is_limited_edition, release_type,
  tags, images,
  detailed_description, sizes_available
) 
SELECT 
  'Air Jordan 1 Retro High - Red Toe', 
  'air-jordan-1-red-toe',
  'Clásica silhoueta de 1985 con el emblemático colorway Red Toe',
  'Jordan',
  'AJ1 Retro High',
  'Red Toe',
  'AJ1-RED-TOE-2024',
  15999, -- $159.99 en céntimos
  15999,
  50,
  (SELECT id FROM categories WHERE slug = 'basketball'),
  NOW()::DATE,
  FALSE,
  'standard',
  ARRAY['classic', 'basketball', 'popular', 'retro'],
  ARRAY['https://via.placeholder.com/600x600?text=AJ1+Red+Toe'],
  '{"materials": "Leather/Nubuck", "fit": "True to size", "care": "Dry clean recommended"}'::JSONB,
  '{"36": 3, "37": 5, "38": 8, "39": 10, "40": 7, "41": 5, "42": 4, "43": 3, "44": 2, "45": 1}'::JSONB
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'AJ1-RED-TOE-2024');

INSERT INTO products (
  name, slug, description, brand, model, colorway, sku,
  price, original_price, stock,
  category_id, release_date, is_limited_edition, release_type,
  tags, images,
  detailed_description, sizes_available
)
SELECT
  'Adidas Yeezy 700 V3 - Azareth',
  'adidas-yeezy-700-v3-azareth',
  'Colaboración exclusiva Kanye West - Adidas con diseño futurista',
  'Adidas',
  'Yeezy 700 V3',
  'Azareth',
  'YZY-700-V3-AZA-2024',
  19999, -- $199.99
  21999,
  15,
  (SELECT id FROM categories WHERE slug = 'limited-editions'),
  NOW()::DATE - INTERVAL '7 days',
  TRUE,
  'restock',
  ARRAY['limited', 'yeezy', 'exclusive', 'hyped', 'recent'],
  ARRAY['https://via.placeholder.com/600x600?text=Yeezy+700+V3'],
  '{"materials": "Primeknit/Suede", "fit": "Size up 0.5", "care": "Hand wash"}'::JSONB,
  '{"36": 1, "37": 2, "38": 2, "39": 3, "40": 2, "41": 2, "42": 1}'::JSONB
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'YZY-700-V3-AZA-2024');

INSERT INTO products (
  name, slug, description, brand, model, colorway, sku,
  price, original_price, stock,
  category_id, release_date, is_limited_edition, release_type,
  tags, images,
  detailed_description, sizes_available
)
SELECT
  'Nike Air Max 90 - Essential',
  'nike-air-max-90-essential',
  'Clásico de Nike con la icónica Air Max visible',
  'Nike',
  'Air Max 90',
  'White/Black',
  'AM90-ESS-WBK-2024',
  12999, -- $129.99
  12999,
  120,
  (SELECT id FROM categories WHERE slug = 'lifestyle'),
  NOW()::DATE,
  FALSE,
  'standard',
  ARRAY['classic', 'lifestyle', 'best-seller', 'versatile'],
  ARRAY['https://via.placeholder.com/600x600?text=Air+Max+90'],
  '{"materials": "Leather/Mesh", "fit": "True to size", "care": "Machine washable"}'::JSONB,
  '{"36": 8, "37": 12, "38": 15, "39": 18, "40": 20, "41": 18, "42": 15, "43": 10, "44": 3, "45": 1}'::JSONB
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'AM90-ESS-WBK-2024');

-- ============================================================================
-- PASO 8: CREAR FUNCTION PARA ACTUALIZAR TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PASO 9: VERIFICAR (OPCIONAL - solo para debugging)
-- ============================================================================

-- Ver todas las tablas creadas
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Ver todas las políticas RLS
-- SELECT * FROM pg_policies;

-- Ver estructura de products
-- \d products;

-- Ver datos de ejemplo
-- SELECT id, name, brand, model, colorway, sku, price, stock FROM products LIMIT 5;
