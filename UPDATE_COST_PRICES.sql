-- ============================================================================
-- ACTUALIZACIÓN: Añadir cost_price a productos existentes
-- ============================================================================
-- Ejecutar en Supabase SQL Editor para actualizar los precios de coste

-- Actualizar cost_price para productos existentes
UPDATE products SET cost_price = 45000 WHERE slug = 'travis-scott-aj1-mocha';
UPDATE products SET cost_price = 28000 WHERE slug = 'travis-scott-sb-dunk';
UPDATE products SET cost_price = 60000 WHERE slug = 'travis-scott-aj4-cactus';
UPDATE products SET cost_price = 70000 WHERE slug = 'jordan-1-chicago-og';
UPDATE products SET cost_price = 38000 WHERE slug = 'jordan-11-space-jam';
UPDATE products SET cost_price = 33000 WHERE slug = 'jordan-3-black-cement';
UPDATE products SET cost_price = 31000 WHERE slug = 'jordan-4-bred';
UPDATE products SET cost_price = 18000 WHERE slug = 'adidas-yeezy-350-zebra';
UPDATE products SET cost_price = 26000 WHERE slug = 'adidas-yeezy-700-wave';
UPDATE products SET cost_price = 21000 WHERE slug = 'adidas-pharrell-nmd-hu';
UPDATE products SET cost_price = 60000 WHERE slug = 'nike-air-max-90-off-white';
UPDATE products SET cost_price = 16000 WHERE slug = 'nb-550-aime-leon-dore';
UPDATE products SET cost_price = 42000 WHERE slug = 'nike-dunk-grateful-dead';
UPDATE products SET cost_price = 35000 WHERE slug = 'sacai-nike-ldwaffle';

-- Verificación: mostrar productos actualizados
SELECT name, slug, price, cost_price, stock, ROUND((price - cost_price) * 100.0 / price, 2) as margen_porcentaje
FROM products
ORDER BY name;
