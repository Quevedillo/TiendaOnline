/**
 * ============================================================================
 * COMPONENTES MEJORADOS PARA TIENDA DE ZAPATOS PREMIUM - DOCUMENTACIÓN
 * ============================================================================
 * 
 * Este archivo contiene ejemplos de componentes listos para implementar.
 * Cada componente está optimizado para una tienda de sneakers exclusive.
 * 
 * INSTRUCCIONES:
 * 1. Copia el código de cada sección
 * 2. Pégalo en la carpeta destino indicada
 * 3. Ajusta imports según tu estructura de proyecto
 */

/**
 * ============================================================================
 * COMPONENTE 1: PRODUCT CARD MEJORADO
 * ============================================================================
 * Ubicación: src/components/product/ProductCard.astro
 * 
 * Características:
 * - Badges dinámicos (nuevo, limitado, descuento)
 * - Indicador de stock
 * - Información de marca y modelo
 * - Descuentos calculados automáticamente
 */

export const ProductCardCode = `
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
  };
}

const { product } = Astro.props;

const discount = product.original_price
  ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
  : null;

const showNew = product.release_date && new Date(product.release_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const showLimited = product.is_limited_edition;
const showLowStock = product.stock > 0 && product.stock < 5;
---

<div class="group cursor-pointer">
  <div class="relative aspect-square bg-neutral-200 overflow-hidden mb-4">
    <img
      src={product.images[0]}
      alt={product.name}
      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
    
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

    <div class="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
      {product.stock > 0 ? \`\${product.stock} en stock\` : 'Agotado'}
    </div>
  </div>

  <div class="space-y-2">
    {product.brand && (
      <p class="text-xs text-neutral-600 uppercase tracking-wider">
        {product.brand}
        {product.model && \` • \${product.model}\`}
      </p>
    )}

    <h3 class="text-lg font-semibold text-brand-navy group-hover:text-brand-charcoal transition-colors">
      {product.name}
    </h3>

    {product.colorway && (
      <p class="text-sm text-neutral-500">
        Colorway: {product.colorway}
      </p>
    )}

    <div class="flex items-center gap-2 pt-2">
      <span class="text-xl font-bold text-brand-navy">
        \${(product.price / 100).toFixed(2)}
      </span>
      {product.original_price && (
        <span class="text-sm text-neutral-500 line-through">
          \${(product.original_price / 100).toFixed(2)}
        </span>
      )}
    </div>

    <a
      href={\`/productos/\${product.slug}\`}
      class="block w-full mt-4 bg-brand-navy text-white py-2 text-center font-semibold hover:bg-brand-charcoal transition-colors"
    >
      Ver Detalles
    </a>
  </div>
</div>
\`;

/**
 * ============================================================================
 * COMPONENTE 2: PRODUCT GALLERY CON ZOOM
 * ============================================================================
 * Ubicación: src/components/product/ProductGallery.tsx
 * 
 * Características:
 * - Vista previa con thumbnails
 * - Zoom al pasar el mouse
 * - Posición de zoom dinámica
 */

export const ProductGalleryCode = \`
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
    <div className="space-y-4">
      <div
        className="relative aspect-square bg-neutral-200 overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={images[selectedIndex]}
          alt={altText}
          className={\`w-full h-full object-cover transition-transform duration-200 \${
            isZoomed ? 'scale-150' : 'scale-100'
          }\`}
          style={
            isZoomed
              ? {
                  transformOrigin: \`\${zoomPos.x}% \${zoomPos.y}%\`,
                }
              : {}
          }
        />
        {isZoomed && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Haz scroll para zoom
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={\`aspect-square rounded border-2 overflow-hidden transition-all \${
              idx === selectedIndex
                ? 'border-brand-navy'
                : 'border-neutral-300 hover:border-neutral-400'
            }\`}
          >
            <img
              src={img}
              alt={\`\${altText} - \${idx + 1}\`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
\`;

/**
 * ============================================================================
 * COMPONENTE 3: SIZE GUIDE (GUÍA DE TALLAS)
 * ============================================================================
 * Ubicación: src/components/ui/SizeGuide.astro
 * 
 * Características:
 * - Tabla de conversión EU/US/UK/CM
 * - Recomendaciones de talla
 * - Responsive
 */

export const SizeGuideCode = \`
---
const sizeChart = {
  EU: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  US: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13'],
  UK: ['3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'],
  CM: ['21.6', '22.2', '22.9', '23.5', '24.1', '24.8', '25.4', '26', '26.7', '27.3', '27.9', '28.6'],
};
---

<div className="bg-neutral-100 p-4 rounded-lg">
  <h3 className="font-semibold text-brand-navy mb-4">Guía de Tallas</h3>
  
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-brand-navy">
          <th className="px-2 py-2 text-left">EU</th>
          <th className="px-2 py-2 text-left">US</th>
          <th className="px-2 py-2 text-left">UK</th>
          <th className="px-2 py-2 text-left">CM</th>
        </tr>
      </thead>
      <tbody>
        {sizeChart.EU.map((eu, idx) => (
          <tr className="border-b border-neutral-300">
            <td className="px-2 py-2 font-semibold">{eu}</td>
            <td className="px-2 py-2">{sizeChart.US[idx] || '-'}</td>
            <td className="px-2 py-2">{sizeChart.UK[idx] || '-'}</td>
            <td className="px-2 py-2">{sizeChart.CM[idx] || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <p className="text-xs text-neutral-600 mt-4">
    💡 Tip: Si estás entre dos tallas, te recomendamos la más grande para máximo confort.
  </p>
</div>
\`;

/**
 * ============================================================================
 * COMPONENTE 4: PRODUCT STATS
 * ============================================================================
 * Ubicación: src/components/product/ProductStats.astro
 * 
 * Características:
 * - Información estructurada del producto
 * - Estado de disponibilidad con colores
 * - Calificaciones
 */

export const ProductStatsCode = \`
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

<div className="grid grid-cols-2 gap-4">
  <div className="bg-neutral-100 p-4 rounded">
    <p className="text-xs text-neutral-600 uppercase tracking-wider">Modelo</p>
    <p className="text-lg font-semibold text-brand-navy">{brand} {model}</p>
  </div>

  <div className="bg-neutral-100 p-4 rounded">
    <p className="text-xs text-neutral-600 uppercase tracking-wider">Colorway</p>
    <p className="text-lg font-semibold text-brand-navy">{colorway}</p>
  </div>

  <div className="bg-neutral-100 p-4 rounded">
    <p className="text-xs text-neutral-600 uppercase tracking-wider">Lanzamiento</p>
    <p className="text-lg font-semibold text-brand-navy">
      {new Date(releaseDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}
    </p>
  </div>

  <div className="bg-neutral-100 p-4 rounded">
    <p className="text-xs text-neutral-600 uppercase tracking-wider">Disponibilidad</p>
    <p 
      className="text-lg font-semibold"
      className:list={{
        'text-green-600': stock > 10,
        'text-orange-600': stock > 0 && stock <= 10,
        'text-red-600': stock === 0
      }}
    >
      {stock > 0 ? \`\${stock} en stock\` : 'Agotado'}
    </p>
  </div>

  {rating > 0 && (
    <div className="bg-neutral-100 p-4 rounded col-span-2">
      <p className="text-xs text-neutral-600 uppercase tracking-wider">Calificación</p>
      <p className="text-lg font-semibold text-brand-navy">
        ⭐ {rating.toFixed(1)} ({reviews} opiniones)
      </p>
    </div>
  )}
</div>
\`;

/**
 * ============================================================================
 * COMPONENTE 5: PRODUCT BADGES
 * ============================================================================
 * Ubicación: src/components/ui/ProductBadge.astro
 * 
 * Características:
 * - Badges reutilizables
 * - Múltiples tipos (new, limited, discount, etc)
 * - Fácil de personalizar
 */

export const ProductBadgeCode = \`
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
    defaultText: 'DESCUENTO'
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

<span className={\`\${config.bg} text-white text-xs font-bold px-2 py-1 rounded inline-block\`}>
  {config.icon} {text || config.defaultText}
  {discount && \` -\${discount}%\`}
</span>
\`;

// Exportar placeholder vacío para TypeScript
export {};

