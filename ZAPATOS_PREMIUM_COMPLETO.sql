-- ============================================================================
-- SQL ZAPATOS PREMIUM - USUARIOS Y AUTENTICACIÓN
-- Ejecutar en Supabase Console (SQL Editor)
-- ============================================================================

-- ============================================================================
-- PASO 0: HABILITAR EXTENSIONES NECESARIAS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PASO 1: CREAR TABLA CATEGORIES (si no existe)
-- ============================================================================

DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar categorías de zapatos
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
('Basketball', 'basketball', 'Zapatos de baloncesto: Jordan, Kyrie, LeBron y más', '🏀', 1),
('Lifestyle', 'lifestyle', 'Sneakers casuales para el día a día: Air Force, Stan Smith, etc.', '👟', 2),
('Running', 'running', 'Zapatillas para correr: Air Max, Ultraboost, Gel-Lyte', '⚡', 3),
('Colecciones Limitadas', 'limited-editions', 'Ediciones limitadas y colaboraciones exclusivas', '✨', 4);

-- ============================================================================
-- PASO 2: CREAR TABLA ACTUALIZADA DE PRODUCTS
-- ============================================================================

DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  detailed_description JSONB,
  
  -- Precios
  price INTEGER NOT NULL,
  original_price INTEGER,
  
  -- Inventario
  stock INTEGER NOT NULL DEFAULT 0,
  sizes_available JSONB,
  
  -- Categorización
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Datos específicos de zapatos
  brand VARCHAR NOT NULL,
  model VARCHAR,
  colorway VARCHAR,
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

-- ============================================================================
-- PASO 3: CREAR TABLA DE PERFIL DE USUARIO
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información personal
  full_name VARCHAR,
  phone VARCHAR,
  avatar_url TEXT,
  
  -- Dirección
  address TEXT,
  city VARCHAR,
  state VARCHAR,
  postal_code VARCHAR,
  country VARCHAR,
  
  -- Información del usuario
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PASO 4: CREAR TABLAS DE FAVORITOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, product_id)
);

-- ============================================================================
-- PASO 5: CREAR TABLA DE CARRITO (persistencia)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, product_id, size)
);

-- ============================================================================
-- PASO 6: CREAR TABLA DE REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PASO 7: CREAR TABLA DE ALERTAS DE RESTOCK
-- ============================================================================

CREATE TABLE IF NOT EXISTS restock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  notified_at TIMESTAMP,
  UNIQUE(user_id, product_id, size)
);

-- ============================================================================
-- PASO 8: CREAR TABLA DE ÓRDENES
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR DEFAULT 'pending',
  total_price INTEGER NOT NULL,
  shipping_address JSONB,
  notes TEXT,
  stripe_payment_id VARCHAR UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PASO 9: CREAR TABLA DE LÍNEAS DE ORDEN
-- ============================================================================

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
-- PASO 10: CREAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_release_date ON products(release_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_admin ON user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON favorites(product_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ============================================================================
-- PASO 11: HABILITAR RLS (Row Level Security)
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 12: CREAR POLÍTICAS RLS
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
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- PRODUCTOS: Solo admin puede actualizar
DROP POLICY IF EXISTS "Only admin can update products" ON products;
CREATE POLICY "Only admin can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- PRODUCTOS: Solo admin puede eliminar
DROP POLICY IF EXISTS "Only admin can delete products" ON products;
CREATE POLICY "Only admin can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- CATEGORÍAS: Lectura pública
DROP POLICY IF EXISTS "Categories readable by all" ON categories;
CREATE POLICY "Categories readable by all"
  ON categories FOR SELECT
  USING (true);

-- PERFIL DE USUARIO: Lectura pública (datos básicos)
DROP POLICY IF EXISTS "Profiles readable by all" ON user_profiles;
CREATE POLICY "Profiles readable by all"
  ON user_profiles FOR SELECT
  USING (true);

-- PERFIL DE USUARIO: Usuarios ven y actualizan su perfil
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- FAVORITOS: Solo usuarios autenticados pueden crear/eliminar favoritos
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- FAVORITOS: Lectura pública de favoritos
DROP POLICY IF EXISTS "Favorites readable by all" ON favorites;
CREATE POLICY "Favorites readable by all"
  ON favorites FOR SELECT
  USING (true);

-- CARRITO: Solo usuarios autenticados pueden gestionar su carrito
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- REVIEWS: Lectura pública
DROP POLICY IF EXISTS "Reviews readable by all" ON product_reviews;
CREATE POLICY "Reviews readable by all"
  ON product_reviews FOR SELECT
  USING (true);

-- REVIEWS: Usuarios autenticados pueden crear reviews
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

-- ORDER ITEMS: Usuarios ven items de propias órdenes
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
-- PASO 13: CREAR FUNCIÓN PARA ACTUALIZAR TIMESTAMP
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
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
-- PASO 14: CREAR FUNCIÓN PARA CREAR PERFIL DE USUARIO AUTOMÁTICAMENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, is_admin, is_active)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', FALSE, TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para crear perfil automáticamente al registrar usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PASO 15: INSERTAR DATOS DE EJEMPLO
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
  15999,
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
  19999,
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
  12999,
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
-- NOTAS IMPORTANTES
-- ============================================================================
/*
1. CREAR USUARIOS EN SUPABASE AUTH:
   - Ve a Dashboard → Authentication → Users
   - Click "Create new user"
   - Email: admin@zapatos.com / Password: Admin123!
   - Email: usuario@zapatos.com / Password: User123!

2. CONVERTIR A ADMIN:
   - Después de crear el usuario admin en auth
   - Ejecuta este SQL:
   
   UPDATE user_profiles 
   SET is_admin = true 
   WHERE id IN (
     SELECT id FROM auth.users WHERE email = 'admin@zapatos.com'
   );

3. CREAR STORAGE BUCKET:
   - Storage → Create new bucket
   - Nombre: products-images
   - Make it Public ✓

4. POLÍTICAS RLS APLICADAS:
   - Productos: Lectura pública, escritura solo admin
   - Carrito: Solo usuarios autenticados
   - Favoritos: Solo usuarios autenticados
   - Órdenes: Solo usuario propietario puede ver
   - Reviews: Lectura pública, escritura usuarios autenticados

5. CAMPOS DE USUARIO:
   - Los usuarios SIN sesión: No pueden agregar favoritos, carrito
   - Los usuarios CON sesión: Pueden hacer todo (favoritos, carrito, reviews)
   - Admin: Puede gestionar productos
*/

-- ============================================================================
-- VERIFICACIÓN (EJECUTAR DESPUÉS)
-- ============================================================================

-- Ver todas las tablas creadas
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Ver datos de ejemplo
-- SELECT id, name, brand, model, colorway, sku, price, stock FROM products LIMIT 5;

-- Ver categorías
-- SELECT id, name, slug, icon, display_order FROM categories ORDER BY display_order;
