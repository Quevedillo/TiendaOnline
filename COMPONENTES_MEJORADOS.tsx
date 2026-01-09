/*
  ============================================================================
  COMPONENTES MEJORADOS PARA TIENDA DE ZAPATOS PREMIUM
  ============================================================================
  
  Este archivo contiene ejemplos de componentes listos para copiar y usar
  en tu proyecto. Cada componente está optimizado para una tienda de 
  sneakers exclusive (Jordan, Adidas, Nike, Yeezy).
  
  Copia el código de los componentes que necesites a su carpeta destino.
*/

// ============================================================================
// 1. PRODUCT CARD MEJORADO - src/components/product/ProductCard.astro
// ============================================================================

/*
---
interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    original_price?: number;
    images: string[];
    brand?: string;
    model?: string;
    colorway?: string;
    stock: number;
    is_limited_edition?: boolean;
    release_date?: string;
    tags?: string[];
  };
}

const { product } = Astro.props;

// Calcular descuento si hay original_price
const discount = product.original_price
  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
  : null;

// Determinar qué badges mostrar
const showNew = product.release_date && new Date(product.release_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const showLimited = product.is_limited_edition;
const showLowStock = product.stock > 0 && product.stock < 5;
---

<div class="group cursor-pointer">
  {/* Imagen del producto */}
  <div class="relative aspect-square bg-neutral-200 overflow-hidden mb-4">
    <img
      src={product.images[0]}
      alt={product.name}
      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
    
    {/* Badges */}
    <div class="absolute top-3 left-3 space-y-2">
      {showNew && (
        <span class="block bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
          🆕 NUEVO
        </span>
      )}
      {showLimited && (
        <span class="block bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
          ⚡ LIMITADO
        </span>
      )}
      {showLowStock && (
        <span class="block bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
          ⚠️ ÚLTIMAS
        </span>
      )}
      {discount && (
        <span class="block bg-brand-gold text-brand-navy text-xs font-bold px-2 py-1 rounded">
          -{discount}%
        </span>
      )}
    </div>

    {/* Stock indicator */}
    <div class="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
      {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
    </div>
  </div>

  {/* Información */}
  <div class="space-y-2">
    {/* Marca y modelo */}
    {product.brand && (
      <p class="text-xs text-neutral-600 uppercase tracking-wider">
        {product.brand}
        {product.model && ` • ${product.model}`}
      </p>
    )}

    {/* Nombre */}
    <h3 class="text-lg font-semibold text-brand-navy group-hover:text-brand-charcoal transition-colors">
      {product.name}
    </h3>

    {/* Colorway */}
    {product.colorway && (
      <p class="text-sm text-neutral-500">
        Colorway: {product.colorway}
      </p>
    )}

    {/* Precios */}
    <div class="flex items-center gap-2 pt-2">
      <span class="text-xl font-bold text-brand-navy">
        ${(product.price / 100).toFixed(2)}
      </span>
      {product.original_price && (
        <span class="text-sm text-neutral-500 line-through">
          ${(product.original_price / 100).toFixed(2)}
        </span>
      )}
    </div>

    {/* CTA */}
    <a
      href={`/productos/${product.slug}`}
      class="block w-full mt-4 bg-brand-navy text-white py-2 text-center font-semibold hover:bg-brand-charcoal transition-colors"
    >
      Ver Detalles
    </a>
  </div>
</div>
*/

// ============================================================================
// 2. FILTROS AVANZADOS - src/components/ProductFilters.astro
// ============================================================================

/*
---
interface Props {
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
}

const { brands = [], minPrice = 0, maxPrice = 500, sizes = [] } = Astro.props;

const allBrands = ['Jordan', 'Adidas', 'Nike', 'Puma', 'New Balance', 'Asics'];
const allSizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
const releaseTypes = [
  { value: 'standard', label: 'Estándar' },
  { value: 'restock', label: 'Restock' },
  { value: 'limited', label: 'Limitada' },
];
---

<form id="filter-form" class="space-y-6 p-6 bg-neutral-50 rounded-lg">
  {/* Brand Filter */}
  <div>
    <h3 class="text-lg font-semibold text-brand-navy mb-3">Marca</h3>
    <div class="space-y-2">
      {allBrands.map(brand => (
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="brand"
            value={brand.toLowerCase()}
            checked={brands.includes(brand)}
            class="w-4 h-4 cursor-pointer"
          />
          <span class="text-sm">{brand}</span>
        </label>
      ))}
    </div>
  </div>

  {/* Price Range */}
  <div>
    <h3 class="text-lg font-semibold text-brand-navy mb-3">Precio</h3>
    <div class="space-y-3">
      <div>
        <label class="text-sm">Mínimo</label>
        <input
          type="range"
          name="minPrice"
          min="0"
          max="500"
          value={minPrice}
          class="w-full"
        />
        <p class="text-xs text-neutral-600 mt-1">${minPrice}</p>
      </div>
      <div>
        <label class="text-sm">Máximo</label>
        <input
          type="range"
          name="maxPrice"
          min="0"
          max="500"
          value={maxPrice}
          class="w-full"
        />
        <p class="text-xs text-neutral-600 mt-1">${maxPrice}</p>
      </div>
    </div>
  </div>

  {/* Size Filter */}
  <div>
    <h3 class="text-lg font-semibold text-brand-navy mb-3">Talla (EU)</h3>
    <div class="grid grid-cols-3 gap-2">
      {allSizes.map(size => (
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="size"
            value={size}
            checked={sizes.includes(size)}
            class="w-4 h-4 cursor-pointer"
          />
          <span class="text-sm">{size}</span>
        </label>
      ))}
    </div>
  </div>

  {/* Release Type */}
  <div>
    <h3 class="text-lg font-semibold text-brand-navy mb-3">Tipo de Lanzamiento</h3>
    <div class="space-y-2">
      {releaseTypes.map(type => (
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="releaseType"
            value={type.value}
            class="w-4 h-4 cursor-pointer"
          />
          <span class="text-sm">{type.label}</span>
        </label>
      ))}
    </div>
  </div>

  {/* Reset Button */}
  <button
    type="reset"
    class="w-full bg-neutral-300 text-neutral-900 py-2 font-semibold hover:bg-neutral-400 transition-colors"
  >
    Limpiar Filtros
  </button>

  {/* Apply Button */}
  <button
    type="submit"
    class="w-full bg-brand-navy text-white py-2 font-semibold hover:bg-brand-charcoal transition-colors"
  >
    Aplicar Filtros
  </button>
</form>

<script>
  const form = document.getElementById('filter-form') as HTMLFormElement;
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const params = new URLSearchParams();

      for (const [key, value] of formData.entries()) {
        params.append(key, value as string);
      }

      window.location.href = `/productos?${params.toString()}`;
    });
  }
</script>
*/

// ============================================================================
// 3. BADGE DE PRODUCTO - src/components/ui/ProductBadge.astro
// ============================================================================

/*
---
interface Props {
  type: 'new' | 'limited' | 'lowstock' | 'discount' | 'bestseller' | 'trending';
  text?: string;
  discount?: number;
}

const { type, text, discount } = Astro.props;

const badgeConfig = {
  new: {
    bg: 'bg-green-500',
    icon: '🆕',
    defaultText: 'NUEVO'
  },
  limited: {
    bg: 'bg-red-600',
    icon: '⚡',
    defaultText: 'LIMITADO'
  },
  lowstock: {
    bg: 'bg-orange-500',
    icon: '⚠️',
    defaultText: 'ÚLTIMAS'
  },
  discount: {
    bg: 'bg-brand-gold',
    icon: '💰',
    defaultText: `DESCUENTO`
  },
  bestseller: {
    bg: 'bg-brand-navy',
    icon: '⭐',
    defaultText: 'BESTSELLER'
  },
  trending: {
    bg: 'bg-purple-600',
    icon: '🔥',
    defaultText: 'TRENDING'
  }
};

const config = badgeConfig[type];
---

<span class={`${config.bg} text-white text-xs font-bold px-2 py-1 rounded inline-block`}>
  {config.icon} {text || config.defaultText}
  {discount && ` -${discount}%`}
</span>
*/

// ============================================================================
// 4. PRODUCT GALLERY CON ZOOM - src/components/product/ProductGallery.tsx
// ============================================================================

/*
import React, { useState } from 'react';

interface Props {
  images: string[];
  altText: string;
}

export default function ProductGallery({ images, altText }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPos({ x, y });
  };

  return (
    <div class="space-y-4">
      {/* Main Image */}
      <div
        class="relative aspect-square bg-neutral-200 overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={images[selectedIndex]}
          alt={altText}
          class={`w-full h-full object-cover transition-transform duration-200 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }
              : {}
          }
        />
        {isZoomed && (
          <div class="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Haz scroll para zoom
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div class="grid grid-cols-4 gap-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            class={`aspect-square rounded border-2 overflow-hidden transition-all ${
              idx === selectedIndex
                ? 'border-brand-navy'
                : 'border-neutral-300 hover:border-neutral-400'
            }`}
          >
            <img
              src={img}
              alt={`${altText} - ${idx + 1}`}
              class="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
*/

// ============================================================================
// 5. SIZE GUIDE - src/components/ui/SizeGuide.astro
// ============================================================================

/*
---
// Tabla de conversión de tallas
const sizeChart = {
  EU: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  US: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
  UK: ['3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'],
  CM: ['21.6', '22.2', '22.9', '23.5', '24.1', '24.8', '25.4', '26', '26.7', '27.3', '27.9', '28.6'],
};
---

<div class="bg-neutral-100 p-4 rounded-lg">
  <h3 class="font-semibold text-brand-navy mb-4">Guía de Tallas</h3>
  
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b-2 border-brand-navy">
          <th class="px-2 py-2 text-left">EU</th>
          <th class="px-2 py-2 text-left">US</th>
          <th class="px-2 py-2 text-left">UK</th>
          <th class="px-2 py-2 text-left">CM</th>
        </tr>
      </thead>
      <tbody>
        {sizeChart.EU.map((eu, idx) => (
          <tr class="border-b border-neutral-300">
            <td class="px-2 py-2 font-semibold">{eu}</td>
            <td class="px-2 py-2">{sizeChart.US[idx] || '-'}</td>
            <td class="px-2 py-2">{sizeChart.UK[idx] || '-'}</td>
            <td class="px-2 py-2">{sizeChart.CM[idx] || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <p class="text-xs text-neutral-600 mt-4">
    💡 Tip: Si estás entre dos tallas, te recomendamos la más grande para máximo confort.
  </p>
</div>
*/

// ============================================================================
// 6. PRODUCT STATS - src/components/product/ProductStats.astro
// ============================================================================

/*
---
interface Props {
  brand: string;
  model: string;
  colorway: string;
  releaseDate: string;
  stock: number;
  rating?: number;
  reviews?: number;
}

const { brand, model, colorway, releaseDate, stock, rating = 0, reviews = 0 } = Astro.props;
---

<div class="grid grid-cols-2 gap-4">
  <div class="bg-neutral-100 p-4 rounded">
    <p class="text-xs text-neutral-600 uppercase tracking-wider">Modelo</p>
    <p class="text-lg font-semibold text-brand-navy">{brand} {model}</p>
  </div>

  <div class="bg-neutral-100 p-4 rounded">
    <p class="text-xs text-neutral-600 uppercase tracking-wider">Colorway</p>
    <p class="text-lg font-semibold text-brand-navy">{colorway}</p>
  </div>

  <div class="bg-neutral-100 p-4 rounded">
    <p class="text-xs text-neutral-600 uppercase tracking-wider">Lanzamiento</p>
    <p class="text-lg font-semibold text-brand-navy">
      {new Date(releaseDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}
    </p>
  </div>

  <div class="bg-neutral-100 p-4 rounded">
    <p class="text-xs text-neutral-600 uppercase tracking-wider">Disponibilidad</p>
    <p class="text-lg font-semibold" class:list={{
      'text-green-600': stock > 10,
      'text-orange-600': stock > 0 && stock <= 10,
      'text-red-600': stock === 0
    }}>
      {stock > 0 ? `${stock} en stock` : 'Agotado'}
    </p>
  </div>

  {rating > 0 && (
    <div class="bg-neutral-100 p-4 rounded col-span-2">
      <p class="text-xs text-neutral-600 uppercase tracking-wider">Calificación</p>
      <p class="text-lg font-semibold text-brand-navy">
        ⭐ {rating.toFixed(1)} ({reviews} opiniones)
      </p>
    </div>
  )}
</div>
*/

export {}; // TypeScript placeholder
