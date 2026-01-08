@echo off
REM Script para visualizar la estructura del proyecto (Windows)
REM Uso: estructura.bat

echo.
echo ========================================
echo   FASHIONMARKET - Estructura Proyecto
echo ========================================
echo.

echo 📁 Directorios Principales:
echo   ✓ src\
echo   ✓ public\
echo   ✓ node_modules\ (generado con npm install)
echo   ✓ dist\ (generado con npm run build)
echo.

echo 📂 src\components\
echo   ├── islands\
echo   │   ├── AddToCartButton.tsx
echo   │   ├── CartIcon.tsx
echo   │   └── CartSlideOver.tsx
echo   ├── product\
echo   │   ├── ProductCard.astro
echo   │   └── ProductGallery.astro
echo   └── ui\
echo       └── Button.astro
echo.

echo 📂 src\pages\
echo   ├── index.astro
echo   ├── carrito.astro
echo   ├── productos\
echo   │   ├── index.astro
echo   │   └── [slug].astro
echo   ├── categoria\
echo   │   └── [slug].astro
echo   └── admin\
echo       ├── index.astro
echo       ├── login.astro
echo       └── productos\
echo           ├── index.astro
echo           └── nuevo.astro
echo.

echo 📂 src\layouts\
echo   ├── BaseLayout.astro
echo   ├── PublicLayout.astro
echo   └── AdminLayout.astro
echo.

echo 📂 src\lib\
echo   ├── supabase.ts
echo   ├── utils.ts
echo   └── product-utils.ts
echo.

echo 📂 src\stores\
echo   └── cart.ts
echo.

echo 📄 Archivos de Configuración:
echo   ✓ astro.config.mjs
echo   ✓ tailwind.config.mjs
echo   ✓ tsconfig.json
echo   ✓ package.json
echo   ✓ .env.example
echo.

echo 📄 Documentación:
echo   ✓ README.md
echo   ✓ SETUP.md
echo   ✓ ARCHITECTURE.md
echo   ✓ ENTREGABLES.md
echo.

echo 💾 Base de Datos:
echo   ✓ database.sql (Schema + RLS + Datos de ejemplo)
echo.

echo ========================================
echo Próximo paso: Leer SETUP.md
echo ========================================
