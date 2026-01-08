# 💻 Comandos Útiles - FashionMarket

## Desarrollo

### Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre: http://localhost:3000
- Hot reload automático
- Frontend + Backend sincronizados

### Ver compilación
```bash
npm run build
```
Genera carpeta `/dist` con optimizaciones de producción

### Previsualizar build
```bash
npm run preview
```
Prueba la versión de producción localmente

---

## Instalación

### Instalar dependencias
```bash
npm install
```

### Actualizar dependencias
```bash
npm update
```

### Instalar paquete específico
```bash
npm install nombre-del-paquete
```

---

## Git

### Inicializar repositorio
```bash
git init
git add .
git commit -m "Initial commit - FashionMarket"
```

### Clonar proyecto
```bash
git clone https://github.com/tu-usuario/fashionmarket.git
```

### Agregar cambios
```bash
git add src/
git commit -m "Agregar nueva funcionalidad"
git push origin main
```

### Ver estado
```bash
git status
```

---

## Base de Datos (Supabase)

### Conectarse desde CLI (opcional)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Conectar a proyecto
supabase link --project-ref xxxxx
```

### Ejecutar migraciones (avanzado)
```bash
supabase migrations up
```

---

## TypeScript

### Verificar tipos
```bash
npx tsc --noEmit
```
Verifica que no hay errores de tipos sin compilar

---

## Testing Manual (Navegador DevTools)

### Console (F12)
```js
// Ver carrito en localStorage
JSON.parse(localStorage.getItem('fashionmarket-cart'))

// Limpiar carrito
localStorage.removeItem('fashionmarket-cart')

// Ver todos los items
localStorage
```

### Network (F12)
```
Ver requests HTTP
- /api/products
- /storage/...
- Verificar cache headers
```

### Application (F12)
```
Local Storage:
- Key: fashionmarket-cart
- Valor: JSON del carrito

Session Storage:
- Datos temporales
```

---

## Variables de Entorno

### Ver variables cargadas
```bash
# En desarrollo, Astro carga automáticamente .env.local
# Para verificar en consola:
console.log(import.meta.env.PUBLIC_SUPABASE_URL)
```

### Cambiar .env
```bash
# Copiar template
cp .env.example .env.local

# Editar con tu editor favorito
code .env.local  # VS Code
```

---

## Supabase CLI (Opcional)

### Instalar
```bash
npm install -g supabase
```

### Crear archivo .env.local desde CLI
```bash
supabase env create
```

### Descargar schema
```bash
supabase db pull
```

### Sincronizar base de datos
```bash
supabase db sync
```

---

## Docker (Producción)

### Crear imagen Docker
```bash
docker build -t fashionmarket:latest .
```

### Ejecutar contenedor
```bash
docker run -p 3000:3000 fashionmarket:latest
```

### Ver logs
```bash
docker logs container-id
```

---

## Vercel (Deploy Recomendado)

### Instalar CLI
```bash
npm install -g vercel
```

### Conectar con repositorio
```bash
git push origin main
# Vercel detecta automáticamente los cambios
```

### Deploy manual
```bash
vercel
```

### Ver logs en producción
```bash
vercel logs
```

---

## Debugging

### Logs de consola
```bash
# En desarrollo, abre DevTools
F12 → Console

# Ver errores en servidor
npm run dev
# Busca errores en terminal
```

### Inspeccionar elementos
```bash
F12 → Elements
# Click selector elemento
# Inspecciona HTML/CSS
```

### Verificar tipos TypeScript
```bash
npx tsc --noEmit
```

### Lint (preparado para futuro)
```bash
# npm install -D eslint prettier
# npx eslint src/
```

---

## Optimización

### Analizar bundle size (futuro)
```bash
npm install -D @astrojs/cli
npx astro build --analyze
```

### Comprimir imágenes
```bash
# Herramientas recomendadas:
# - ImageOptim (Mac)
# - IrfanView (Windows)
# - Online: tinypng.com
```

---

## Helpers útiles

### Limpiar caché
```bash
# npm
rm -rf node_modules package-lock.json
npm install

# Git
git clean -fdx
```

### Resetear proyecto
```bash
git reset --hard HEAD
git clean -fdx
```

### Ver estructura carpetas
```bash
# Linux/Mac
bash view-structure.sh

# Windows
estructura.bat
```

---

## Flujos de Trabajo Comunes

### Crear nuevo componente
```bash
# 1. Crear archivo
touch src/components/islands/MiComponente.tsx

# 2. Escribir código React
# 3. Agregar a página con client:load
# 4. npm run dev para probar
```

### Crear nueva página
```bash
# 1. Crear archivo
touch src/pages/nueva-pagina.astro

# 2. Escribir contenido Astro
# 3. Automáticamente accesible en /nueva-pagina
```

### Agregar producto a BD
```sql
-- En Supabase SQL Editor:
INSERT INTO products (name, slug, description, price, stock, category_id, images)
VALUES (
  'Nombre Producto',
  'slug-producto',
  'Descripción...',
  9900,  -- $99.00 en céntimos
  10,
  (SELECT id FROM categories WHERE slug = 'camisas'),
  ARRAY['https://url-imagen.com/img.jpg']
);
```

### Consultar datos
```sql
-- Ver productos
SELECT * FROM products LIMIT 10;

-- Ver categorías
SELECT * FROM categories;

-- Ver admins
SELECT * FROM admin_users;
```

---

## Atajos Teclado

### VS Code
```
Ctrl+K Ctrl+S     → Ver todos los atajos
Ctrl+Shift+F      → Buscar en archivos
Ctrl+.            → Quick fix
Ctrl+D            → Seleccionar palabra
```

### Navegador DevTools
```
F12                → Abrir DevTools
Ctrl+Shift+I       → Inspect element
Ctrl+Shift+C       → Selector tool
Ctrl+Shift+J       → Console
```

---

## URLs Importantes

```
Desarrollo:        http://localhost:3000
Supabase Console:  https://app.supabase.com
Vercel Dashboard:  https://vercel.com/dashboard
GitHub:            https://github.com/tu-usuario/fashionmarket
```

---

## Troubleshooting por Línea Comando

### Error: "Port 3000 in use"
```bash
# Cambiar puerto
npm run dev -- --port 3001

# O matar proceso:
lsof -i :3000  # Ver qué usa el puerto
kill -9 PID    # Matar proceso
```

### Error: "Module not found"
```bash
# Reinstalar
rm -rf node_modules
npm install
npm run dev
```

### Error: ".env not found"
```bash
cp .env.example .env.local
# Editar con credenciales correctas
```

### Error: "Cannot connect to Supabase"
```bash
# Verificar:
1. .env.local tiene URL y key correctas
2. Proyecto Supabase está activo
3. Internet conectado
```

---

## Performance

### Medir velocidad
```bash
# En DevTools → Lighthouse
# Click Generate report
```

### Ver bundle size
```bash
npm run build
# Revisar output en terminal
```

### Cachear con Browser DevTools
```
F12 → Network
Throttle: "Fast 3G"
Reload y observa tiempos de carga
```

---

## Mantenimiento

### Actualizar Astro
```bash
npm update astro
```

### Actualizar todas las dependencias
```bash
npm update
```

### Verificar vulnerabilidades
```bash
npm audit
npm audit fix
```

### Limpiar logs npm
```bash
npm cache clean --force
```

---

## Scripts Útiles (package.json)

```json
{
  "scripts": {
    "dev": "astro dev",           // Desarrollo
    "build": "astro build",       // Producción
    "preview": "astro preview",   // Ver build
    "astro": "astro"              // CLI Astro
  }
}
```

---

## Próximos Comandos (Fase 2)

Cuando agregues más herramientas:

```bash
# ESLint
npm run lint

# Tests
npm run test

# Coverage
npm run test:coverage

# Pre-commit hooks
npm run prepare
```

---

**¡Domina estos comandos para trabajo eficiente!** 🚀
