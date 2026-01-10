# KicksPremium - Sneakers Exclusivos y Limitados

Tienda de **Sneakers Exclusivos** con **Astro 5.0**, **Supabase**, **Stripe** y **Tailwind CSS**.

## Colecciones

- **Travis Scott** - Colaboraciones exclusivas con Jordan y Nike
- **Jordan Special** - Air Jordans de ediciones especiales
- **Adidas Collab** - Colaboraciones con artistas reconocidos
- **Exclusive Drops** - Ediciones limitadas y piezas raras

## Estructura del Proyecto

```
kickspremium/
├── public/
│   └── fonts/                      # Tipografias personalizadas
├── src/
│   ├── components/
│   │   ├── islands/               # Componentes interactivos React
│   │   │   ├── AddToCartButton.tsx
│   │   │   ├── CartIcon.tsx
│   │   │   └── CartSlideOver.tsx
│   │   ├── product/               # Componentes de producto
│   │   │   ├── ProductCard.astro
│   │   │   └── ProductGallery.astro
│   │   └── ui/                    # Componentes UI genericos
│   │       └── Button.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro       # Layout base
│   │   ├── PublicLayout.astro     # Layout tienda publica
│   │   └── AdminLayout.astro      # Layout panel admin
│   ├── lib/
│   │   └── supabase.ts            # Cliente Supabase singleton
│   ├── pages/
│   │   ├── index.astro            # Homepage
│   │   ├── productos/
│   │   │   ├── index.astro        # Listado productos (SSG)
│   │   │   └── [slug].astro       # Detalle producto (SSG)
│   │   ├── categoria/
│   │   │   └── [slug].astro       # Filtro por categoria
│   │   ├── carrito.astro          # Pagina carrito (SSR)
│   │   └── admin/
│   │       ├── index.astro        # Dashboard admin (SSR)
│   │       ├── login.astro        # Login admin (SSR)
│   │       └── productos/
│   │           ├── index.astro    # Gestion inventario (SSR)
│   │           ├── nuevo.astro    # Crear producto (SSR)
│   │           └── [id].astro     # Editar producto (SSR)
│   ├── stores/
│   │   └── cart.ts                # Nano Stores - Estado carrito
│   ├── styles/
│   │   └── global.css             # Estilos CSS globales
│   ├── middleware.ts              # Auth middleware
│   └── env.d.ts                   # Tipos TypeScript
├── astro.config.mjs               # Configuracion Astro (output: hybrid)
├── tailwind.config.mjs            # Configuracion Tailwind personalizada
├── tsconfig.json                  # Config TypeScript
├── package.json
├── SETUP_DATABASE.sql             # Schema PostgreSQL completo
└── .env.example
```

## Paleta de Colores - Estilo Sneaker
- **Crema**: `#F9F8F6` (Background)
- **Dorado Mate**: `#D4AF6C` (Accent)
- **Neutros**: Grises calibrados del 50 al 900

## 🔧 Stack Tecnológico

### Frontend
- **Astro 5.0** - Generación estática (SSG) + Server-Side (SSR)
- **React 18** - Componentes interactivos (Islands)
- **Tailwind CSS 3** - Estilos utilitarios
- **Nano Stores** - Estado persistente del carrito

### Backend
- **Supabase** - PostgreSQL + Auth + Storage
- **Row Level Security (RLS)** - Control de acceso granular

### Features

✅ **Tienda Pública (SSG)**
- Catálogo de productos filtrables por categoría
- Ficha de producto detallada con galería de imágenes
- Carrito de compra (Nano Stores) con panel deslizante
- Búsqueda y filtros

✅ **Panel Admin (SSR Protegido)**
- Autenticación vía Supabase Auth
- CRUD completo de productos
- Subida de imágenes drag-and-drop a Storage
- Dashboard con estadísticas

✅ **Rendimiento**
- Pre-renderizado estático para catálogo
- Hidratación parcial (Islands) para interactividad
- Caché de imágenes optimizado
- Bundle size mínimo

## 🚀 Instalación y Configuración

### 1. Clonar y instalar dependencias

```bash
cd fashionmarket
npm install
```

### 2. Configurar Supabase

#### a. Crear proyecto en Supabase
1. Ir a https://supabase.com
2. Crear nuevo proyecto
3. Obtener `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`

#### b. Ejecutar SQL Schema
1. En Supabase Console → SQL Editor
2. Copiar contenido de `database.sql`
3. Ejecutar el script completo

#### c. Crear Storage Bucket

En Supabase Console → SQL Editor, ejecutar:

```sql
-- Crear bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products-images', 'products-images', true);

-- Políticas de acceso
CREATE POLICY "Public read access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'products-images');

CREATE POLICY "Admin upload access"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'products-images'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );
```

### 3. Variables de entorno

Copiar `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Completar con tus credenciales de Supabase:

```
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Crear admin user

En Supabase Console:

1. Ir a Authentication → Users
2. Crear nuevo user (email + password)
3. Copiar el UUID generado
4. En SQL Editor, ejecutar:

```sql
INSERT INTO admin_users (id, email, full_name, role)
VALUES ('your-uuid', 'admin@fashionmarket.com', 'Admin User', 'admin');
```

### 5. Desarrollo

```bash
npm run dev
```

Abrirá http://localhost:3000

## 📖 Guía de Componentes Clave

### AddToCartButton.tsx - "Isla" Interactiva

```tsx
import AddToCartButton from '@components/islands/AddToCartButton';

export default function ProductDetail() {
  return (
    <AddToCartButton 
      product={product} 
      client:load  // Hidratación al cargar la página
    />
  );
}
```

**Características:**
- Selección de talla
- Control de cantidad
- Validación de stock
- Integración con Nano Store
- Feedback visual

### Nano Stores - Estado del Carrito

```ts
import { 
  cartStore, 
  addToCart, 
  removeFromCart,
  getCartTotal 
} from '@stores/cart';

// Añadir producto
addToCart(product, quantity, size);

// Obtener total
const total = getCartTotal();

// Persistencia automática en localStorage
```

## 🔐 Autenticación y RLS

### Políticas de Base de Datos

**Productos:**
- ✅ Lectura pública: Solo productos `active`
- ✅ Lectura admin: Todos los productos
- ✅ Escritura/Edición: Solo admins verificados

**Imágenes:**
- ✅ Lectura pública: Todo el bucket
- ✅ Subida: Solo admins
- ✅ Eliminación: Solo admins

### Middleware de Autenticación

```ts
// src/middleware.ts
export function onRequest(context, next) {
  if (context.url.pathname.startsWith('/admin')) {
    const user = context.locals.user;
    if (!user) {
      return context.redirect('/admin/login');
    }
  }
  return next();
}
```

## 📊 Modelos de Datos

### Producto (products)
- `id` (UUID)
- `name`, `slug`, `description`
- `price` (integer, céntimos)
- `stock` (integer)
- `category_id` (FK)
- `images` (TEXT[], URLs)
- `sku`, `material`, `weight`
- `status` (active|inactive|archived)
- `created_at`, `updated_at`

### Carrito (Nano Store)
```ts
{
  items: [
    {
      product_id: string;
      product: Product;
      quantity: number;
      size: string;
    }
  ];
  isOpen: boolean;
}
```

## 🎯 Próximos Pasos (Fase 2)

- [ ] Integración Stripe para pagos
- [ ] Email transaccionales (Resend/SendGrid)
- [ ] Órdenes y seguimiento
- [ ] Reviews y ratings
- [ ] SEO Meta tags optimizados
- [ ] Analytics (Plausible/Vercel)
- [ ] CI/CD con GitHub Actions
- [ ] Deployment a Vercel

## 📝 Notas de Desarrollo

### SSG vs SSR en Astro

```astro
---
// Esto siempre se ejecuta en build time (SSG)
const { data } = await fetch('...');
---

<div>{data}</div>

{/* Componente interactivo = SSR + Client */}
<AddToCartButton client:load product={data} />
```

### Tailwind + Astro

La configuración ya está lista en `astro.config.mjs`. Los estilos se aplican automáticamente:

```astro
<div class="bg-brand-navy text-white px-4 py-2">
  Estilo con variables custom
</div>
```

### Imágenes en Supabase Storage

```ts
const imageUrl = supabase.storage
  .from('products-images')
  .getPublicUrl(filepath).data.publicUrl;
```

## 🐛 Troubleshooting

**El carrito no persiste:**
- Verificar localStorage está habilitado
- Comprobar que Nano Stores está instalado

**Imágenes no se cargan:**
- Verificar RLS policies en bucket
- Comprobar rutas de imagen en base de datos

**Auth no funciona:**
- Verificar keys de Supabase en `.env.local`
- Comprobar tabla `admin_users` existe

## 📚 Referencias

- [Astro Docs](https://docs.astro.build)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Nano Stores](https://github.com/nanostores/nanostores)
- [React Islands in Astro](https://docs.astro.build/en/concepts/islands/)

---

**Creado con ❤️ para FashionMarket**
*Arquitectura moderna, performance enterprise-grade, estética premium.*
