# 🚀 Guía de Instalación y Setup - FashionMarket

## Requisitos Previos

- **Node.js**: v18+ ([descargar](https://nodejs.org/))
- **npm**: v9+ (incluido con Node.js)
- **Git**: Para control de versiones
- **Cuenta Supabase**: Gratuita en [supabase.com](https://supabase.com)

Verifica que está instalado:

```bash
node --version  # v18.0.0 o superior
npm --version   # v9.0.0 o superior
```

## Paso 1: Crear Proyecto Supabase

### 1.1 Registrarse en Supabase

1. Visita [supabase.com](https://supabase.com)
2. Haz clic en **"Sign Up"**
3. Conecta con GitHub (recomendado)
4. Verifica tu email

### 1.2 Crear Nuevo Proyecto

1. En el dashboard, haz clic en **"New Project"**
2. Completa:
   - **Name**: `fashionmarket` (o tu preferencia)
   - **Database Password**: Guarda en lugar seguro
   - **Region**: Elige más cercana a tu ubicación
3. Espera a que se cree el proyecto (2-3 minutos)

### 1.3 Obtener Credenciales

1. En tu proyecto, ve a **Settings → API**
2. Copia estas credenciales:
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon public` → `PUBLIC_SUPABASE_ANON_KEY`
3. Ve a **Settings → Database → Reveal connection string** (solo si necesitas service role)
   - Busca y copia: `SUPABASE_SERVICE_ROLE_KEY`

📝 **Guarda estas credenciales en lugar seguro** (no las compartas públicamente)

## Paso 2: Clonar el Repositorio

```bash
cd ~
git clone https://github.com/tu-usuario/fashionmarket.git
cd fashionmarket
```

O simplemente navega a la carpeta que ya existe:

```bash
cd c:\Users\tu-usuario\Desktop\tiendaOnline
```

## Paso 3: Instalar Dependencias

```bash
npm install
```

Esto descargará e instalará:
- `astro`
- `react`
- `@supabase/supabase-js`
- `nanostores`
- `tailwindcss`
- Otras dependencias

El proceso toma 2-5 minutos según tu conexión.

## Paso 4: Configurar Variables de Entorno

### 4.1 Crear archivo `.env.local`

```bash
cp .env.example .env.local
```

### 4.2 Editar `.env.local`

Abre el archivo en tu editor favorito y completa:

```env
# Supabase - Obtén de Settings → API
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role (para operaciones del servidor)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin (opcional, para seeding)
ADMIN_EMAIL=admin@fashionmarket.com
```

⚠️ **IMPORTANTE**: No compartas este archivo. Incluye en `.gitignore`:

```bash
# .gitignore
.env.local
.env*.local
```

## Paso 5: Ejecutar SQL Schema en Supabase

### 5.1 Abrir SQL Editor

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Haz clic en **+ New Query**

### 5.2 Ejecutar Schema

1. Abre el archivo `database.sql` de tu proyecto
2. Copia TODO el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **▶ Run** (o presiona Ctrl+Enter)

Deberías ver: "Success. No rows returned." (esto es correcto)

### 5.3 Verificar Tablas Creadas

En el panel izquierdo, bajo **"Tables"**, deberías ver:
- ✅ `categories`
- ✅ `products`
- ✅ `admin_users`

## Paso 6: Crear Storage Bucket

### 6.1 En SQL Editor

Copia y ejecuta estos comandos:

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

CREATE POLICY "Admin delete access"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'products-images'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );
```

Espera a que se ejecute (deberías ver "Success").

### 6.2 Verificar Bucket

Ve a **Storage** en el menú lateral. Deberías ver el bucket `products-images`.

## Paso 7: Crear Usuario Admin

### 7.1 Crear en Authentication

1. Ve a **Authentication → Users**
2. Haz clic en **+ Add user**
3. Completa:
   - Email: `admin@fashionmarket.com` (o el que prefieras)
   - Password: `TuContraseñaSegura123!` (cópiala)
   - Auto send invite email: Deselecciona
4. Haz clic en **Save**

### 7.2 Copiar UUID del Usuario

1. Verás la fila de usuario creado
2. Haz clic para expandir
3. Copia el **UUID** (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 7.3 Registrar en Tabla admin_users

En SQL Editor, ejecuta:

```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  'PEGA_EL_UUID_AQUI',
  'admin@fashionmarket.com',
  'Admin User',
  'admin',
  true
);
```

Ejemplo:

```sql
INSERT INTO admin_users (id, email, full_name, role, is_active)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@fashionmarket.com',
  'Admin User',
  'admin',
  true
);
```

Presiona **Run**. Deberías ver "1 row inserted".

## Paso 8: Ejecutar en Desarrollo

### 8.1 Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Verás algo como:

```
  ▶ Astro v5.0.0 started in 123ms

  ┃ Local    http://localhost:3000/
  ┃ Network  use --host to expose
```

### 8.2 Abrir en Navegador

Visita: http://localhost:3000

Deberías ver:
- Homepage con hero section
- Navegación funcionando
- Icono de carrito en la esquina superior derecha

### 8.3 Probar Funcionalidades

**Catálogo:**
- Haz clic en "Explorar Catálogo"
- Deberías ver productos de ejemplo (Camisa Oxford, Pantalón Chino, Traje)

**Carrito:**
- Haz clic en un producto
- Selecciona talla y cantidad
- Haz clic en "Añadir al Carrito"
- El carrito debería abrirse y mostrar el producto

**Panel Admin:**
- Ve a `http://localhost:3000/admin/productos`
- Deberías ver tabla de productos

## Paso 9: Datos de Prueba

Los datos de ejemplo se insertaron automáticamente en SQL (3 productos en base de datos).

Si necesitas agregar más, en SQL Editor:

```sql
INSERT INTO products (
  name,
  slug,
  description,
  price,
  stock,
  category_id,
  images,
  material,
  sku
) VALUES (
  'Chaqueta de Cuero Premium',
  'chaqueta-cuero-premium',
  'Chaqueta de cuero genuino, corte perfecto para ocasiones especiales.',
  29900, -- $299.00
  5,
  (SELECT id FROM categories WHERE slug = 'camisas'),
  ARRAY['https://via.placeholder.com/500x500?text=Chaqueta'],
  'Cuero 100%',
  'CHA-001'
);
```

## Paso 10: Construir para Producción

Cuando estés listo para desplegar:

```bash
npm run build
```

Esto genera:
- Carpeta `/dist` con HTML pre-renderizado
- Assets optimizados
- Listo para Vercel, Netlify, etc.

```bash
npm run preview
```

Prueba la build localmente en `http://localhost:3000`

## 🐛 Troubleshooting

### "Error: Missing Supabase configuration"

**Causa**: `.env.local` no tiene credenciales.

**Solución**:
```bash
1. Verifica que .env.local existe
2. Que tiene PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY
3. Guarda el archivo
4. Reinicia npm run dev
```

### "Access Denied" en admin panel

**Causa**: El usuario no está en tabla `admin_users`.

**Solución**:
1. En Supabase SQL Editor
2. Ejecuta: `SELECT * FROM admin_users;`
3. Si está vacía, sigue Paso 7 de nuevo
4. Verifica que el UUID es exacto

### Las imágenes no se cargan

**Causa**: Bucket no tiene políticas correctas.

**Solución**:
1. Ve a Storage → products-images
2. Haz clic en **Policies**
3. Verifica que tienes estas 3:
   - "Public read access"
   - "Admin upload access"
   - "Admin delete access"

### "Cannot find module 'nanostores'"

**Causa**: Dependencias no instaladas.

**Solución**:
```bash
rm -rf node_modules
npm install
npm run dev
```

### El carrito no persiste entre recargas

**Causa**: localStorage no está disponible.

**Solución**:
1. Abre DevTools (F12)
2. Ve a Application → Local Storage
3. Verifica que existe clave `fashionmarket-cart`
4. Si no, agrega un producto y recarga

## 📚 Próximos Pasos

Ahora que tienes el stack funcionando:

1. **Customizar Marca**
   - Edita `tailwind.config.mjs` (colores, tipografía)
   - Modifica logos en layouts

2. **Agregar Productos**
   - Ve a `/admin/productos/nuevo`
   - O usa SQL para insertar en batch

3. **Integrar Stripe** (Fase 2)
   - Crea cuenta en stripe.com
   - Agrega API keys a `.env.local`
   - Implementa checkout

4. **Desplegar a Producción**
   - Push a GitHub
   - Conecta Vercel/Netlify
   - Configura dominio personalizado

5. **Analytics y Monitoreo**
   - Integra Plausible Analytics
   - Configura error tracking (Sentry)

## 📞 Soporte

Documentación importante:
- [Astro Docs](https://docs.astro.build)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

¿Problemas?
1. Revisa el log en terminal (npm run dev)
2. Abre DevTools del navegador (F12)
3. Consulta Troubleshooting arriba

---

**¡Tu tienda online está lista!** 🎉

Ahora puedes comenzar a agregar productos, personalizar la marca y prepararse para el lanzamiento.
