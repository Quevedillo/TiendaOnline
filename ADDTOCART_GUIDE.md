# 🛒 Guía de Uso - AddToCartButton (Componente Isla)

## ¿Qué es una "Isla" (Island)?

En Astro, una **Isla** es un componente interactivo (React/Vue/Svelte) que se hidrata selectivamente dentro de una página estática. Solo se carga el JavaScript necesario.

```
┌─────────────────────────────────────────┐
│  Página Astro (SSG - HTML estático)     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Contenido estático (sin JS)    │   │
│  │  - Título                       │   │
│  │  - Descripción                  │   │
│  │  - Galería de imágenes          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🏝️ ISLA INTERACTIVA (React)    │   │
│  │  - AddToCartButton.tsx          │   │
│  │  - Código JavaScript hidratado  │   │
│  │  - Maneja estado local + store   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Más contenido estático         │   │
│  │  - Reviews                      │   │
│  │  - Productos relacionados       │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Uso en una Página Astro

### Ejemplo: `/src/pages/productos/[slug].astro`

```astro
---
// Parte del servidor (ejecuta en build time)
import PublicLayout from '@layouts/PublicLayout.astro';
import ProductGallery from '@components/product/ProductGallery.astro';
import AddToCartButton from '@components/islands/AddToCartButton';  // ← React!
import { supabase } from '@lib/supabase';

const { slug } = Astro.params;

// Obtén datos (en build time para SSG)
const { data: product } = await supabase
  .from('products')
  .select('*')
  .eq('slug', slug)
  .single();
---

<PublicLayout title={product.name}>
  <section class="py-12 md:py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Galería estática */}
        <div>
          <ProductGallery 
            images={product.images} 
            productName={product.name}
          />
        </div>

        {/* Información del producto (estático) */}
        <div class="space-y-6">
          <h1 class="text-4xl font-display font-bold text-brand-navy">
            {product.name}
          </h1>
          
          <p class="text-xl font-bold text-brand-charcoal">
            ${(product.price / 100).toFixed(2)}
          </p>

          {/* 🏝️ ISLA INTERACTIVA (React se hidrata aquí) */}
          <AddToCartButton 
            product={product} 
            client:load   {/* ← Hidratación al cargar la página */}
          />

          {/* Más contenido estático */}
          <div class="prose">
            <p>{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</PublicLayout>
```

### Directivas de Hidratación

```astro
{/* 
  Astro tiene varias directivas para controlar cuándo 
  se hidrata un componente interactivo:
*/}

<!-- Hidratación inmediata (al cargar página) -->
<AddToCartButton product={p} client:load />

<!-- Hidratación diferida (cuando scroll llegue al componente) -->
<AddToCartButton product={p} client:visible />

<!-- Hidratación después de que página esté lista -->
<AddToCartButton product={p} client:idle />

<!-- Hidratación solo en navegador (no en SSR) -->
<AddToCartButton product={p} client:only="react" />

<!-- Solo en servidor (no se hidrata) - ¡ERROR en componente interactivo! -->
<!-- <AddToCartButton product={p} /> -->
```

---

## Flujo de Interacción: AddToCartButton

### 1️⃣ Usuario Abre Página de Producto

```
GET /productos/camisa-oxford-premium
    ↓
Astro pre-renderiza HTML en build time
    ↓
Servidor sirve HTML estático (⚡ rápido)
    ↓
Navegador recibe + renderiza HTML
    ↓
React hidrata AddToCartButton (carga JavaScript)
    ↓
Botón es interactivo ✅
```

### 2️⃣ Usuario Selecciona Talla

```
Usuario: Click en "L"
    ↓
React state: selectedSize = "L"
    ↓
Componente se re-renderiza (visual change)
    ↓
Botón "Añadir al Carrito" activo ✅
```

### 3️⃣ Usuario Selecciona Cantidad

```
Usuario: Click + (incrementar)
    ↓
React state: quantity = 2
    ↓
Componente se re-renderiza
    ↓
Input muestra "2" ✅
```

### 4️⃣ Usuario Clica "Añadir al Carrito"

```
Usuario: Click en botón
    ↓
handleAddToCart() se ejecuta:
  1. Valida: ¿Talla seleccionada?
  2. Valida: ¿Stock disponible?
  3. Llama: addToCart(product, quantity, size)
    ↓
addToCart() actualiza Nano Store:
  cartStore.set({ 
    items: [...items, newItem], 
    isOpen: true 
  })
    ↓
Trigger: cartStore.subscribe() 
  localStorage.setItem('fashionmarket-cart', JSON.stringify(...))
    ↓
cartSlideOver se abre (renderiza panel)
    ↓
Usuario ve carrito con producto ✅
```

---

## Código Fuente Comentado

### src/components/islands/AddToCartButton.tsx

```tsx
import React, { useState } from 'react';
import { addToCart, openCart } from '@stores/cart';
import type { Product } from '@lib/supabase';

interface AddToCartButtonProps {
  product: Product;
  client: boolean;
}

export default function AddToCartButton({ 
  product, 
  client = true 
}: AddToCartButtonProps) {
  // Estado local del componente (React)
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [feedback, setFeedback] = useState<string>('');

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = () => {
    // Validaciones
    if (!selectedSize) {
      setFeedback('Por favor, selecciona una talla');
      return;
    }

    if (product.stock <= 0) {
      setFeedback('Producto agotado');
      return;
    }

    // Actualiza Nano Store (persistencia global)
    addToCart(product, quantity, selectedSize);
    openCart();

    // Feedback usuario
    setFeedback('✓ Agregado al carrito');
    setQuantity(1);
    setSelectedSize('');

    // Borra feedback después 2 segundos
    setTimeout(() => setFeedback(''), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Selección de Talla */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Talla
        </label>
        <div className="grid grid-cols-6 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`py-2 px-3 text-sm font-medium border-2 transition-colors ${
                selectedSize === size
                  ? 'border-brand-navy bg-brand-navy text-white'
                  : 'border-neutral-300 bg-white text-gray-900 hover:border-brand-navy'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={product.stock <= 0}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Control de Cantidad */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Cantidad
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 border border-neutral-300 text-gray-900 hover:bg-neutral-50"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))
            }
            className="w-16 text-center border border-neutral-300 py-2"
          />
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="px-3 py-2 border border-neutral-300 text-gray-900 hover:bg-neutral-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Botón Principal */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock <= 0}
        className={`w-full py-3 px-4 font-semibold transition-colors ${
          product.stock > 0
            ? 'bg-brand-navy text-white hover:bg-brand-charcoal cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {product.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}
      </button>

      {/* Feedback Visual */}
      {feedback && (
        <p className={`text-center text-sm ${feedback.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
          {feedback}
        </p>
      )}

      {/* Info Stock */}
      <p className="text-xs text-neutral-600">
        {product.stock > 0
          ? `${product.stock} en stock`
          : 'No disponible'}
      </p>
    </div>
  );
}
```

---

## Interacción con Nano Stores

### Cómo AddToCartButton Actualiza el Carrito Global

```
AddToCartButton.tsx (componente React)
    ↓
handleAddToCart()
    ↓
addToCart(product, 2, 'L')
    ↓
src/stores/cart.ts
    ↓
cartStore.set({
  items: [
    {
      product_id: 'uuid-123',
      product: { name: 'Camisa', price: 9900, ... },
      quantity: 2,
      size: 'L'
    }
  ],
  isOpen: true
})
    ↓
Trigger: cartStore.subscribe()
    ↓
localStorage.setItem('fashionmarket-cart', JSON.stringify(...))
    ↓
CartIcon.tsx se re-renderiza (badge actualizado)
    ↓
CartSlideOver.tsx se abre (panel deslizante)
    ↓
Otros componentes suscritos a cartStore se actualizan ✅
```

---

## Testing Manual

### Caso 1: Flujo Completo

```
1. ✓ Abre página producto
2. ✓ Verifica que AddToCartButton está visible
3. ✓ Intenta clickear "Añadir" sin seleccionar talla
   → Espera: "Por favor, selecciona una talla"
4. ✓ Selecciona una talla (ej: M)
5. ✓ Incrementa cantidad a 3
6. ✓ Clica "Añadir al Carrito"
   → Espera: "✓ Agregado al carrito"
   → Espera: CartSlideOver se abre
   → Espera: Badge en icono carrito = 3
7. ✓ Abre DevTools → Local Storage
   → Espera: Key "fashionmarket-cart" con JSON
8. ✓ Recarga página (F5)
   → Espera: Carrito persiste
9. ✓ Cierra navegador y reabre
   → Espera: Carrito sigue ahí
```

### Caso 2: Stock Agotado

```
Si product.stock = 0:
1. ✓ Botón debe estar deshabilitado (gris)
2. ✓ Texto: "Agotado"
3. ✓ Seleccionar talla debe estar deshabilitada
4. ✓ Click en botón no hace nada
```

### Caso 3: Validación de Cantidad

```
1. ✓ Input no permite <1
2. ✓ Input no permite >stock
3. ✓ Botón + respeta límite
4. ✓ Cambio manual en input valida
```

---

## Performance Notes

### Bundle Size

```
AddToCartButton.tsx:
├── React: ~42KB (compartido con otros Islands)
├── Nanostores: ~2KB
├── Código componente: ~5KB
└── Total (gzipped): ~15KB

Pero:
- Se carga solo en páginas que lo usan
- Rest of page (HTML) es estático
- Media load: 2-3 segundos (bueno)
```

### Rendering

```
Build time:    0ms (no se ejecuta)
               ↓
SSG HTML:      Estático, sin JavaScript
               ↓
Navegador:     HTML renderiza (≈ 100ms)
               ↓
Hidratación:   React se inicializa (≈ 500ms)
               ↓
Interactivo:   Usuario puede usar (total ≈ 600ms)
```

---

## Próximas Mejoras

### Fase 2
- [ ] Integrar con Stripe
- [ ] Mostrar "Aceptar términos"
- [ ] Selector de colores
- [ ] Animaciones suaves
- [ ] Analytics en addToCart

### Fase 3
- [ ] Wishlist
- [ ] Comparator de productos
- [ ] Stock countdown
- [ ] Social sharing

---

**AddToCartButton es la pieza clave que conecta** la experiencia estática (catálogo rápido) con la interactividad necesaria (carrito dinámico). 🎯
