# Resolución de Problemas - Admin Panel y Órdenes

## Problemas Reportados
1. ❌ Al crear un artículo → página se recarga sola pero no avanza
2. ❌ Al editar un artículo → página se recarga sola pero no avanza
3. ❌ Órdenes muestran total de 0€

## Causas Identificadas

### Problema 1 y 2: Creación/Edición de Productos Fallando

**Root Cause 1:** Error en generación de slug
- En `nuevo.astro`, la línea de slug tenía error de lógica con `?.` encadenados
- Cuando `formData.get('name')?.toString()` era undefined, causaba error al llamar `.toLowerCase()`

**Root Cause 2:** Manejo incorrecto de checkboxes
- El código buscaba `formData.get('is_featured') === 'on'`
- Debería usar `formData.has('is_featured')` para HTML inputs type="checkbox"

**Root Cause 3:** API PUT incompleta
- El endpoint `/api/admin/products/[id].ts` no manejaba todos los campos enviados
- Faltaban: `compare_price`, `material`, `color`, `is_featured`, `is_active`

**Root Cause 4:** Falta de validación en trim()
- Los valores no se limpiaban de espacios en blanco, causando validaciones fallidas

### Problema 3: Órdenes con Total 0€

**Root Cause:** Nombre de columna incorrecto
- Webhook Stripe guardaba en columna `total_price`
- Página de pedidos leía de columna `total_amount`
- La columna correcta en BD es `total_amount`

## Soluciones Aplicadas

### Archivo: `src/pages/admin/productos/nuevo.astro`
```javascript
// ANTES (incorrecto)
const productData = {
  slug: (formData.get('slug')?.toString().trim() || formData.get('name')?.toString().toLowerCase().replace(...))?.replace(...),
  // ... otros campos sin trim()
  is_featured: formData.get('is_featured') === 'on',
  is_active: formData.get('is_active') === 'on',
}

// DESPUÉS (correcto)
const name = formData.get('name')?.toString().trim() || '';
const slug = formData.get('slug')?.toString().trim() || 
  name.toLowerCase().normalize('NFD').replace(...).replace(...).replace(...);

const productData = {
  name: name,
  slug: slug,
  // ... todos los campos con trim()
  is_featured: formData.has('is_featured'),
  is_active: formData.has('is_active'),
}
```

### Archivo: `src/pages/admin/productos/[slug]/editar.astro`
- Aplicadas las mismas fixes que en nuevo.astro
- Actualizado manejo de checkboxes con `formData.has()`
- Agregado trim() a todos los campos de texto

### Archivo: `src/pages/api/admin/products/[id].ts`
```typescript
// Agregados campos que faltaban:
const {
  name, slug, description, price, 
  compare_price,      // ← Agregado
  stock, category_id, brand, sku,
  material,           // ← Agregado
  color,              // ← Agregado
  is_featured,        // ← Agregado
  is_active,          // ← Agregado
  images
} = body;

// Actualización mejorada:
const { data, error } = await supabase
  .from('products')
  .update({
    name, slug, description, price,
    compare_price: compare_price || null,
    stock: stock || 0,
    category_id,
    brand: brand || null,
    sku: sku || null,
    material: material || null,
    color: color || null,
    is_featured: is_featured || false,
    is_active: is_active !== false,
    images: images || [],
    updated_at: new Date().toISOString(),
  })
  .eq('id', id)
  .select()
  .single();
```

### Archivos: Stripe Webhooks
`src/pages/api/webhooks/stripe.ts` y `src/pages/api/sync/stripe-orders.ts`
```typescript
// ANTES (incorrecto)
total_price: session.amount_total || 0

// DESPUÉS (correcto)
total_amount: session.amount_total || 0
```

## Status de Correción
✅ Lógica de slug arreglada
✅ Checkboxes usando formData.has()
✅ Trim() agregado a todos los campos
✅ API PUT actualizada con todos los campos
✅ Webhook Stripe guardando en columna correcta
✅ Nueva órdenes mostrarán total correcto

## Notas Importantes
- Las órdenes existentes en BD que tienen total_amount = 0 no se auto-actualizarán
- Si necesitas actualizar órdenes existentes, contacta a soporte
- Desde ahora, todas las nuevas órdenes tendrán el total correcto
- Todas las creaciones y ediciones de productos funcionarán correctamente

## Commits
- `eea2bbf68` - Fix product creation/update and order total amount issues

## Testing Recomendado
1. Intenta crear un nuevo producto → debería redirigirse a `/admin/productos?created=true`
2. Edita un producto existente → debería redirigirse a `/admin/productos?updated=true`
3. Completa una compra y verifica que el total se muestre correctamente en `/admin/pedidos`
