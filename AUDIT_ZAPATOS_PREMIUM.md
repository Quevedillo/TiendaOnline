# 🏗️ AUDITORÍA DE ARQUITECTURA - FashionMarket → ZapatosPremium

**Fecha:** 9 de enero de 2026  
**Evaluador:** Arquitecto de Software Senior - E-commerce Headless  
**Proyecto:** Tienda Online de Zapatos Exclusivos (Jordan, Adidas, Nike, etc.)  
**Stack:** Astro 5.0 + Supabase + Tailwind CSS + Nano Stores

---

## 📊 RESUMEN EJECUTIVO

✅ **Estado General:** 75% completado | **Calidad:** Alta  
⚠️ **Prioridades críticas:** 3 ajustes esenciales  
🔄 **Recomendaciones:** 8 mejoras arquitectónicas

Tu proyecto tiene **bases sólidas**, pero necesita optimizaciones específicas para convertirse en una tienda de zapatos premium de clase mundial (al nivel de SNKRS, StockX, Foot Locker Elite).

---

## 🎯 PUNTOS FUERTES ACTUALES

### 1. **Arquitectura Técnica Correcta** ✅
- Astro 5.0 configurado (aunque en modo SSG puro, ver nota abajo)
- Supabase integrado correctamente con tipos TypeScript
- Middleware de autenticación en lugar
- Nano Stores para estado del carrito

### 2. **Diseño Visual Coherente** ✅
- Paleta de colores sofisticada (Navy, Charcoal, Cream, Gold)
- Tipografía elegante (Playfair Display + Inter)
- Concepto "Minimalismo Sofisticado" bien articulado

### 3. **Estructura de Componentes Modular** ✅
- Separación clara: UI, Product, Islands
- Componentes Astro + Islands React bien organizados
- Almacén de estado centralizado

---

## ⚠️ PROBLEMAS CRÍTICOS A RESOLVER

### 1. **OUTPUT MODE INCORRECTO** 🔴
**Ubicación:** [astro.config.mjs](astro.config.mjs#L4)

```javascript
// ❌ ACTUAL (INCORRECTO)
output: 'static', // SSG - static generation

// ✅ DEBE SER
output: 'hybrid',
```

**Por qué:** Tu especificación requiere:
- Catálogo público (productos, categorías) → SSG
- Carrito, checkout, admin → SSR protegido

Con `output: 'static'`, NO puedes hacer SSR en `/admin` ni `/carrito`.

### 2. **TIPOS DE PRODUCTOS INCORRECTOS PARA ZAPATOS** 🔴
**Ubicación:** [src/pages/index.astro](src/pages/index.astro#L29-L30)

```typescript
// ❌ ACTUAL (Para moda genérica)
{ name: 'Camisas', slug: 'camisas' },
{ name: 'Pantalones', slug: 'pantalones' },
{ name: 'Trajes', slug: 'trajes' },

// ✅ DEBE SER (Para zapatos premium)
{ name: 'Basketball', slug: 'basketball', icon: '🏀' },
{ name: 'Lifestyle', slug: 'lifestyle', icon: '👟' },
{ name: 'Running', slug: 'running', icon: '⚡' },
{ name: 'Colecciones Limitadas', slug: 'limited-editions', icon: '✨' },
```

### 3. **SELECCIÓN DE TALLA INCORRECTA** 🔴
**Ubicación:** [src/components/islands/AddToCartButton.tsx](src/components/islands/AddToCartButton.tsx#L15)

```typescript
// ❌ ACTUAL (Para ropa)
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// ✅ DEBE SER (Para zapatos - tallas numéricas)
const sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
// O sistema US: ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
// O ambos con conversión
```

---

## 🔧 MEJORAS ARQUITECTÓNICAS RECOMENDADAS

### Mejora 1: Esquema de BD para Zapatos Exclusivos
**Ubicación:** Base de datos Supabase

Necesitas campos adicionales en tabla `products`:
```sql
-- Campos ADICIONALES a agregar:
- brand VARCHAR (Jordan, Adidas, Nike, Puma, etc.)
- model VARCHAR (AJ1, Yeezy, Ultra Boost, etc.)
- release_date DATE (Para limited editions)
- colorway VARCHAR (Red Toe, Chicago, Bred, etc.)
- sku VARCHAR UNIQUE (SKU específico por talla)
- original_price INTEGER (MSRP original, para mostrar descuentos)
- sizes_available JSONB ({ "36": 5, "37": 3, ... })
- tags TEXT[] (ARRAY: 'limited', 'hyped', 'restock', etc.)
- is_limited_edition BOOLEAN
```

### Mejora 2: Componente ProductCard Mejorado
Agregar:
- Badge de "Limited Edition" / "New Release"
- Mostrar colorway con preview visual
- Indicador de stock por talla (heat map visual)
- Precio comparativo (original vs actual)
- Rating/reviews (preparación para Stripe)

### Mejora 3: Gallery Mejorada para Zapatos
```astro
<!-- Necesitas:
  - Zoom en imagen (hover)
  - Rotación 360° de producto (si disponible)
  - Comparador de tallas interactivo
  - Vista de detalles (plantilla, materiales)
-->
```

### Mejora 4: Filtros de Búsqueda Sofisticados
```typescript
Filtros para zapatos:
- Brand: Jordan, Adidas, Nike, etc.
- Release Type: New, Restock, Limited
- Price Range: slider $
- Size: checkboxes para todas las tallas
- Colorway: color picker
- Condition: DS (Deadstock), VNDS, Used
- Hype Level: trending, popular, coming-soon
```

### Mejora 5: Sistema de Notificaciones para Restocks
Agregar tabla `restock_alerts`:
```sql
CREATE TABLE restock_alerts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  size VARCHAR NOT NULL,
  created_at TIMESTAMP,
  notified_at TIMESTAMP
);
```

### Mejora 6: Integración de Imágenes en Alta Resolución
Para zapatos, necesitas:
- Sistema de drag & drop múltiple (ya existe)
- Validación de resolución mínima (2000x2000px recomendado)
- Watermark automático (opcional, para evitar copias)
- CDN con optimización (Supabase Storage + Vercel)

### Mejora 7: Middleware de Autenticación Incompleto
**Ubicación:** [src/middleware.ts](src/middleware.ts#L8)

```typescript
// ❌ ACTUAL - Solo comentarios
if (!user) {
  // return context.redirect("/admin/login");
}

// ✅ DEBE SER - Implementado
export const onRequest = defineMiddleware(async (context, next) => {
  const isAdminRoute = context.url.pathname.startsWith("/admin");

  if (isAdminRoute) {
    const sessionCookie = context.cookies.get('sb-session-token');
    
    if (!sessionCookie) {
      return context.redirect("/admin/login");
    }

    try {
      const user = await verifySupabaseSession(sessionCookie.value);
      context.locals.user = user;
    } catch {
      context.cookies.delete('sb-session-token');
      return context.redirect("/admin/login");
    }
  }

  return next();
});
```

### Mejora 8: Validación de Stock en Checkout
Falta protección contra:
- Compra de último item (race condition)
- Cambio de precio entre carrito y checkout
- Stock negativo en BD

---

## 📋 TABLA DE CAMBIOS NECESARIOS

| Prioridad | Componente | Cambio | Impacto | Esfuerzo |
|-----------|-----------|--------|--------|----------|
| 🔴 CRÍTICA | astro.config.mjs | Cambiar a `output: 'hybrid'` | Habilita SSR | 5 min |
| 🔴 CRÍTICA | index.astro | Categorías de zapatos | Relevancia de marca | 10 min |
| 🔴 CRÍTICA | AddToCartButton.tsx | Tallas numéricas | UX correcta | 10 min |
| 🟠 ALTA | supabase.ts | Extender tipos Product | Datos completos | 20 min |
| 🟠 ALTA | middleware.ts | Implementar auth real | Seguridad admin | 30 min |
| 🟠 ALTA | ProductCard.astro | Badges y metadata | Diferenciación | 25 min |
| 🟡 MEDIA | cart.ts | Validación de stock | Integridad datos | 15 min |
| 🟡 MEDIA | ProductGallery.astro | Zoom 360° | Experiencia | 40 min |

---

## 🗄️ ESQUEMA SQL ACTUALIZADO (ZAPATOS)

```sql
-- Tabla categorías (sin cambios)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla productos (EXPANDIDA para zapatos)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Básico
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  detailed_description JSONB, -- { materials, fit, care_instructions }
  
  -- Pricing
  price INTEGER NOT NULL, -- en céntimos (e.g., 14999 = $149.99)
  original_price INTEGER, -- MSRP para mostrar descuento
  
  -- Inventory
  stock INTEGER NOT NULL DEFAULT 0,
  sizes_available JSONB, -- { "36": 5, "37": 3, "38": 8 }
  
  -- Categorización
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Datos específicos de zapatos
  brand VARCHAR NOT NULL, -- Jordan, Adidas, Nike, Puma, etc.
  model VARCHAR, -- AJ1, Yeezy 700, etc.
  colorway VARCHAR, -- Red Toe, Bred, Chicago, etc.
  sku VARCHAR UNIQUE NOT NULL,
  
  -- Release & Collectors
  release_date DATE,
  is_limited_edition BOOLEAN DEFAULT FALSE,
  release_type VARCHAR DEFAULT 'standard', -- standard, restock, limited
  
  -- SEO & Tags
  tags TEXT[] DEFAULT '{}', -- ['hyped', 'upcoming', 'popular', 'new']
  images TEXT[] NOT NULL, -- URLs de Supabase Storage
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_original_price CHECK (original_price IS NULL OR original_price >= price)
);

-- Tabla de reviews (preparación para Stripe Reviews)
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de alertas de restock
CREATE TABLE restock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  notified_at TIMESTAMP,
  UNIQUE(user_id, product_id, size)
);

-- RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Política: Leer productos es público
CREATE POLICY "Products are readable by everyone"
  ON products FOR SELECT
  USING (true);

-- Política: Solo admins pueden modificar
CREATE POLICY "Only admin can modify products"
  ON products FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));

CREATE POLICY "Only admin can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));

-- Índices para performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
```

---

## 🔐 CONFIGURACIÓN SUPABASE STORAGE

### Bucket: `products-images`

**Crear con CLI:**
```bash
supabase storage create-bucket products-images --public
```

**O en Dashboard:**
1. Storage → Create new bucket
2. Name: `products-images`
3. Make it public ✓
4. Create

**Políticas RLS para Storage:**
```sql
-- Política: Público puede leer
CREATE POLICY "Public can read products images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products-images');

-- Política: Solo admin puede subir/modificar
CREATE POLICY "Admin can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products-images' 
    AND auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')
  );

CREATE POLICY "Admin can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products-images'
    AND auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')
  );
```

---

## 📱 RECOMENDACIONES DE UX ESPECÍFICAS PARA ZAPATOS

### 1. **Página de Producto Mejorada**
- Mostrar colorway con preview visual
- "Otros colores disponibles" → galería thumbnail
- Tabla comparativa de tallas (EU, US, CM)
- Badge de "Just Released", "Limited Stock", "Last Sizes"
- Sección "Detalles del Material" (Cuero, Malla, Goma)

### 2. **Sistema de Filtros Dinámico**
```
Filtros recomendados:
├─ Brand (checkboxes)
├─ Price Range (slider)
├─ Size (mostrar stock disponible)
├─ Release Status (New, Restock, Coming Soon)
├─ Colorway (color picker)
└─ Trending (Latest, Most Viewed, Best Sellers)
```

### 3. **Homepage Rediseñado**
```
Hero: "Premium Exclusive Sneakers"
├─ Tres secciones destacadas:
│  ├─ New Releases (últimos 5 días)
│  ├─ Limited Editions (stock < 10)
│  └─ Most Hyped (trending)
├─ Newsletter suscripción
└─ Trust badges (Authentic, Fast Shipping, 30-day returns)
```

### 4. **Notificaciones de Restock**
- "Out of stock" → Button "Notify me"
- Email cuando vuelve el zapato en la talla seleccionada

---

## 🚀 PLAN DE IMPLEMENTACIÓN (ORDEN RECOMENDADO)

### Fase 1: Crítica (Hoy - 2 horas)
- [ ] Cambiar `output: 'hybrid'` en astro.config.mjs
- [ ] Actualizar categorías a zapatos en index.astro
- [ ] Cambiar tallas a numéricas en AddToCartButton.tsx

### Fase 2: Alta (Próximos 2 días)
- [ ] Extender tipos de Product para brand, model, colorway, SKU
- [ ] Implementar middleware de auth real
- [ ] Actualizar esquema SQL en Supabase
- [ ] Mejorar ProductCard con badges

### Fase 3: Media (Esta semana)
- [ ] Agregar filtros avanzados
- [ ] Implementar zoom 360° en galería
- [ ] Crear tabla de restock_alerts
- [ ] Validación de stock mejorada

### Fase 4: Polish (Próxima semana)
- [ ] Sistema de reviews
- [ ] Notificaciones por email
- [ ] Analytics (Google Analytics 4)
- [ ] SEO optimization

---

## 📊 CHECKLIST DE CALIDAD

### Rendimiento ✅
- [ ] Lighthouse Score > 90
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### Seguridad ✅
- [ ] HTTPS forzado
- [ ] Headers de seguridad (CSP, HSTS)
- [ ] RLS en todas las tablas
- [ ] Validación backend de stock

### Accesibilidad ✅
- [ ] WCAG 2.1 AA
- [ ] Color contrast > 4.5:1
- [ ] Teclado navegable
- [ ] Screen reader compatible

### UX ✅
- [ ] Mobile-first responsive
- [ ] Tiempo carga < 3s
- [ ] CTA clara (Añadir al carrito)
- [ ] Checkout < 3 pasos

---

## 💡 PRÓXIMOS PASOS INMEDIATOS

1. **Aplica los cambios críticos** (30 min)
2. **Ejecuta el SQL** actualizado en Supabase
3. **Prueba la compilación**: `npm run build`
4. **Despliega en preview** antes de producción

---

## 📞 SOPORTE

- **Documentación Astro:** https://docs.astro.build
- **Supabase:** https://supabase.com/docs
- **Tailwind:** https://tailwindcss.com

---

**Evaluación Final:** Tu proyecto está en **buen camino**. Con estas mejoras (especialmente los 3 cambios críticos), tendrás una tienda de zapatos premium que compete con los mejores en la industria.

🎯 **Objetivo alcanzable:** Lanzar en producción en 2 semanas.
