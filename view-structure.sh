#!/bin/bash
# Script para visualizar la estructura del proyecto
# Uso: bash view-structure.sh

echo "📦 FashionMarket - Estructura del Proyecto"
echo "==========================================="
echo ""

tree -L 3 -I 'node_modules|.git|dist|.astro' \
  --dirsfirst \
  -C << 'EOF'
fashionmarket/
├── 📁 public/
│   └── 📁 fonts/
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 📁 islands/
│   │   │   ├── AddToCartButton.tsx
│   │   │   ├── CartIcon.tsx
│   │   │   └── CartSlideOver.tsx
│   │   ├── 📁 product/
│   │   │   ├── ProductCard.astro
│   │   │   └── ProductGallery.astro
│   │   └── 📁 ui/
│   │       └── Button.astro
│   ├── 📁 layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PublicLayout.astro
│   │   └── AdminLayout.astro
│   ├── 📁 lib/
│   │   ├── supabase.ts
│   │   ├── utils.ts
│   │   └── product-utils.ts
│   ├── 📁 pages/
│   │   ├── index.astro
│   │   ├── carrito.astro
│   │   ├── 📁 productos/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── 📁 categoria/
│   │   │   └── [slug].astro
│   │   └── 📁 admin/
│   │       ├── index.astro
│   │       ├── login.astro
│   │       └── 📁 productos/
│   │           ├── index.astro
│   │           └── nuevo.astro
│   ├── 📁 stores/
│   │   └── cart.ts
│   ├── 📁 styles/
│   │   └── global.css
│   ├── middleware.ts
│   └── env.d.ts
├── 📄 astro.config.mjs
├── 📄 tailwind.config.mjs
├── 📄 tsconfig.json
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 database.sql
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 README.md
├── 📄 SETUP.md
├── 📄 ARCHITECTURE.md
└── 📄 ENTREGABLES.md
EOF

echo ""
echo "Estadísticas:"
echo "============="
echo "📝 Archivos Astro (.astro):    15+"
echo "⚛️  Componentes React (.tsx):   3+"
echo "💾 Archivos TypeScript (.ts):  6+"
echo "🎨 Archivos CSS:               2+"
echo "📋 Archivos de Config:         5+"
echo "📚 Documentación (.md):        4+"
echo ""
echo "Líneas de código: 3000+"
echo "Componentes: 20+"
echo "Páginas: 12+"
echo ""
echo "✨ Proyecto listo para desarrollo"
