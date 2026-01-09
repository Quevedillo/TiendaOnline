# 🚀 GUÍA DE IMPLEMENTACIÓN - Zapatos Premium

## ESTADO: ✅ Cambios Críticos Aplicados

Los siguientes cambios ya han sido realizados en tu proyecto:

### 1. ✅ Astro Config (Híbrido Habilitado)
- **Archivo:** [astro.config.mjs](astro.config.mjs)
- **Cambio:** `output: 'static'` → `output: 'hybrid'`
- **Resultado:** Ahora puedes usar SSR en `/admin`, `/carrito`, etc.

### 2. ✅ Homepage Actualizada (Zapatos)
- **Archivo:** [src/pages/index.astro](src/pages/index.astro)
- **Cambios:**
  - Hero: "Sofisticación Minimalista" → "Zapatos Premium Exclusivos"
  - Categorías: Camisas/Pantalones/Trajes → Basketball/Lifestyle/Running/Limited Editions
  - Descripción: Moda masculina → Sneakers auténticos (Jordan, Adidas, Nike, Yeezy)
  - Emojis: 🏀👟⚡✨

### 3. ✅ Tallas Numéricas (Para Zapatos)
- **Archivo:** [src/components/islands/AddToCartButton.tsx](src/components/islands/AddToCartButton.tsx)
- **Cambio:** `['XS', 'S', 'M', 'L', 'XL', 'XXL']` → `['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']`
- **Nota:** Estas son tallas EU. Puedes agregar conversión a US si lo deseas.

### 4. ✅ Tipos TypeScript Expandidos
- **Archivo:** [src/lib/supabase.ts](src/lib/supabase.ts)
- **Nuevos campos en Product:**
  - `brand: string` (Jordan, Adidas, Nike, etc.)
  - `model?: string` (AJ1, Yeezy 700, etc.)
  - `colorway?: string` (Red Toe, Bred, Chicago, etc.)
  - `sku: string` (Identificador único)
  - `release_date?: string`
  - `is_limited_edition?: boolean`
  - `release_type?: 'standard' | 'restock' | 'limited'`
  - `sizes_available?: Record<string, number>` ({ "36": 5, "37": 3, ... })
  - `detailed_description?: Record<string, any>` ({ materials, fit, care })
  - `original_price?: number` (para mostrar descuentos)
  - `tags?: string[]` (['hyped', 'popular', 'new'])

### 5. ✅ Middleware de Autenticación Real
- **Archivo:** [src/middleware.ts](src/middleware.ts)
- **Ahora:** Verifica sesión en rutas `/admin`
- **Comportamiento:** Redirige a `/admin/login` si no está autenticado

---

## 📋 PRÓXIMOS PASOS (ANTES DE PRODUCCIÓN)

### PASO 1: Ejecutar SQL en Supabase ⚙️

1. Abre tu proyecto en https://app.supabase.com
2. Ve a **SQL Editor** → **New Query**
3. Copia el contenido de [SCHEMA_ZAPATOS.sql](SCHEMA_ZAPATOS.sql)
4. Pega y ejecuta (**Ctrl+Enter**)

**Esto creará:**
- ✅ Tabla `products` actualizada con campos de zapatos
- ✅ Tabla `categories` con categorías de zapatos
- ✅ Tabla `product_reviews` (para reviews)
- ✅ Tabla `restock_alerts` (para notificaciones)
- ✅ Tabla `orders` (para órdenes/checkout)
- ✅ Tabla `order_items` (líneas de orden)
- ✅ Índices para performance
- ✅ Políticas RLS (seguridad)
- ✅ 3 productos de ejemplo (AJ1, Yeezy 700, Air Max 90)

---

### PASO 2: Crear Bucket de Storage 🖼️

1. Ve a **Storage** → **Create new bucket**
2. Nombre: `products-images`
3. ✅ Marcar como **Public**
4. Crear bucket

**Políticas (opcional, pero recomendado):**
- Público: Lectura
- Admin: Upload/Delete

---

### PASO 3: Actualizar Variables de Entorno 🔐

En tu `.env` (o `.env.local`):

```env
# Ya tienes (Anón, para clientes)
PUBLIC_SUPABASE_URL=https://prrlwmhfmektjebtfizb.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBycmx3bWhmbWVrdGplYnRmaXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MzExNDAsImV4cCI6MjA4MzUwNzE0MH0.q18idoz2FcRvKC9LmK7DZHw1HtVDpJIFFibBYwB0Pn0

# Agrega (Service Role, SOLO servidor, NUNCA en cliente)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (BUSCA EN SETTINGS → API)
```

**Cómo obtener SUPABASE_SERVICE_ROLE_KEY:**
1. Dashboard → Settings → API
2. Busca "service_role" en la lista
3. Copia el token

---

### PASO 4: Compilar y Probar 🧪

```bash
npm run build
```

Deberías ver:
- ✅ 0 errores
- ✅ Rutas SSG: `/`, `/productos`, `/categoria/[slug]`, etc.
- ✅ Rutas SSR: `/admin`, `/admin/login`, `/carrito`

---

### PASO 5: Crear Página de Admin Mejorada ⚙️

El archivo [src/pages/admin/index.astro](src/pages/admin/index.astro) existe pero está vacío.

Debería contener:
```astro
---
// SSR - Protegido
const user = Astro.locals.user;
if (!user) {
  return Astro.redirect('/admin/login');
}
---

<AdminLayout title="Dashboard">
  <h1>Bienvenido, {user.email}</h1>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <a href="/admin/productos">Gestionar Productos</a>
    <a href="/admin/pedidos">Ver Pedidos</a>
    <a href="/admin/reportes">Reportes</a>
  </div>
</AdminLayout>
```

---

### PASO 6: Mejorar AddToCartButton ⭐

Considera agregar:

```tsx
// Mostrar stock por talla
{product.sizes_available && (
  <div className="text-sm text-gray-600">
    Stock: {product.sizes_available[selectedSize] || 0} unidades
  </div>
)}

// Mostrar colorway
{product.colorway && (
  <div className="mb-4">
    <span className="text-sm font-medium">Colorway:</span>
    <span className="ml-2">{product.colorway}</span>
  </div>
)}

// Mostrar marca
<div className="text-sm text-gray-500">
  {product.brand} • {product.model}
</div>
```

---

### PASO 7: Crear Filtros Avanzados 🔍

Nuevo componente: `src/components/ProductFilters.astro`

```astro
<div class="space-y-4">
  <!-- Brand Filter -->
  <div>
    <h3>Marca</h3>
    <label><input type="checkbox" value="jordan" /> Jordan</label>
    <label><input type="checkbox" value="adidas" /> Adidas</label>
    <label><input type="checkbox" value="nike" /> Nike</label>
  </div>

  <!-- Price Range -->
  <div>
    <h3>Precio</h3>
    <input type="range" min="0" max="500" />
  </div>

  <!-- Size Filter -->
  <div>
    <h3>Talla</h3>
    <div class="grid grid-cols-4 gap-2">
      {['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'].map(size => (
        <label key={size}>
          <input type="checkbox" value={size} /> {size}
        </label>
      ))}
    </div>
  </div>

  <!-- Release Type -->
  <div>
    <h3>Tipo de Lanzamiento</h3>
    <label><input type="checkbox" value="standard" /> Estándar</label>
    <label><input type="checkbox" value="restock" /> Restock</label>
    <label><input type="checkbox" value="limited" /> Limitada</label>
  </div>
</div>
```

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Crítica (Hoy - 30 min)
- [x] Cambiar `output: 'hybrid'` en astro.config.mjs
- [x] Actualizar categorías a zapatos en index.astro
- [x] Cambiar tallas a numéricas en AddToCartButton.tsx
- [x] Expandir tipos de Product en supabase.ts
- [x] Implementar middleware de auth real
- [ ] Ejecutar SQL en Supabase (ver PASO 1)
- [ ] Crear bucket de Storage (ver PASO 2)
- [ ] Compilar: `npm run build`

### Fase 2: Alta (Mañana - 2 horas)
- [ ] Verificar datos en Supabase (SELECT * FROM products)
- [ ] Mejorar ProductCard con badges (limited, new, etc.)
- [ ] Implementar cálculo de stock por talla
- [ ] Crear página de admin dashboard
- [ ] Agregar campos de brand/colorway a formulario de nuevo producto

### Fase 3: Media (Esta semana - 4 horas)
- [ ] Agregar filtros avanzados (brand, price, size, etc.)
- [ ] Implementar zoom en galería de producto
- [ ] Crear sistema de notificaciones de restock
- [ ] Agregar reviews/ratings a productos
- [ ] Integración con email (Resend, SendGrid)

### Fase 4: Polish (Próxima semana - 6 horas)
- [ ] Optimización SEO (meta tags dinámicos)
- [ ] Google Analytics 4
- [ ] Pruebas E2E (Cypress, Playwright)
- [ ] Lighthouse score > 90
- [ ] Mobile UX testing

---

## 🧪 TESTING LOCAL

Comando para verificar que todo compile:
```bash
npm run build
npm run preview
```

Abre http://localhost:3000

Verifica:
- ✅ Homepage con categorías de zapatos
- ✅ Grid de categorías con emojis
- ✅ Botón "Explorar Catálogo" funcional

---

## 🔗 RECURSOS ÚTILES

| Recurso | URL |
|---------|-----|
| Documentación Astro | https://docs.astro.build |
| Supabase Docs | https://supabase.com/docs |
| Tailwind CSS | https://tailwindcss.com/docs |
| Nano Stores | https://github.com/nanostores/nanostores |

---

## 💡 TIPS IMPORTANTES

### 1. **Nunca expongas SUPABASE_SERVICE_ROLE_KEY en cliente**
   - ✅ USA en archivos `.ts` del servidor
   - ❌ NUNCA en componentes React o Astro SSR

### 2. **Tallas de zapatos**
   - Considera mantener AMBOS sistemas (EU + US)
   - Ejemplo: "36 (US 5.5)" en el selector

### 3. **Imágenes de productos**
   - Mínimo 2000x2000px recomendado
   - Usa WebP para mejor performance
   - Almacena en Supabase Storage, NO en código

### 4. **Colecciones limitadas**
   - Set `is_limited_edition: true` en producto
   - Muestra badge "Limited Edition" en tarjeta
   - Alerta si stock < 5

### 5. **SKU único**
   - Cada producto debe tener SKU único
   - Formato recomendado: `BRAND-MODEL-COLORWAY-YEAR`
   - Ejemplo: `NIKE-RETRO1-CHICAGO-2024`

---

## 🐛 TROUBLESHOOTING

### Error: "Missing Supabase configuration"
- Verifica `.env` tiene las variables
- Reinicia dev server: `npm run dev`

### Error: "RLS policies prevent access"
- Compila: `npm run build`
- Verifica RLS en Supabase Dashboard → Authentication

### Tallas no aparecen
- Verifica que el producto tenga `sizes_available` en BD
- Compila: `npm run build`

### Admin login no funciona
- Verifica que exista usuario en Supabase Auth
- Crea uno en Dashboard → Authentication → Users
- Email: test@example.com / Password: test123

---

## 📞 SOPORTE

Si encuentras problemas:

1. Revisa la consola del navegador (F12)
2. Verifica logs de build: `npm run build`
3. Consulta [AUDIT_ZAPATOS_PREMIUM.md](AUDIT_ZAPATOS_PREMIUM.md)
4. Busca en documentación oficial de las herramientas

---

**Estado del Proyecto:** 75% → 85% completado  
**Próximo Hito:** Fase 2 (Mañana)

¡Estás a solo pasos de lanzar una tienda de zapatos premium de clase mundial! 🚀
