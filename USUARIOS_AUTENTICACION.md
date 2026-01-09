# 🚀 GUÍA DE IMPLEMENTACIÓN - Usuarios y Autenticación

**Fecha:** 9 de enero de 2026  
**Estado:** SQL + Componentes Listos para Implementar

---

## 📋 QUÉ SE INCLUYE

### 1. **SQL Completo** ✅
Archivo: `ZAPATOS_PREMIUM_COMPLETO.sql`

Incluye:
- Tablas de productos, categorías
- Tabla `user_profiles` (perfiles de usuario)
- Tabla `favorites` (favoritos)
- Tabla `cart_items` (carrito persistente)
- Tabla `product_reviews` (reviews)
- Tabla `restock_alerts` (alertas de restock)
- Tabla `orders` + `order_items` (órdenes)
- Políticas RLS (Row Level Security)
- Triggers para timestamps automáticos
- 3 productos de ejemplo
- 4 categorías de zapatos

---

## 🔐 POLÍTICAS DE ACCESO

### Usuarios SIN Sesión (Anónimos)
```
✅ VER: Catálogo, productos, categorías, reviews
❌ NO PUEDEN: 
   - Agregar a favoritos
   - Agregar al carrito
   - Crear reviews
   - Ver órdenes
```

### Usuarios CON Sesión (Autenticados)
```
✅ PUEDEN:
   - Ver catálogo
   - Agregar a favoritos
   - Agregar al carrito
   - Ver/editar su carrito
   - Crear reviews
   - Ver sus órdenes
   - Editar perfil
```

### Administrador
```
✅ TIENE TODO LO DEL USUARIO +
   - Crear productos
   - Editar productos
   - Eliminar productos
   - Ver todas las órdenes
   - Estadísticas
```

---

## 📊 BOTONES Y COMPORTAMIENTO

### Usuario Anónimo
```
┌─────────────────────────────────────┐
│  [Iniciar Sesión]  (azul marino)    │
└─────────────────────────────────────┘
```

### Usuario Autenticado
```
┌──────────────────────────────────────┐
│  👤 Juan  ▼                          │
├──────────────────────────────────────┤
│  Conectado como: juan@zapatos.com   │
├──────────────────────────────────────┤
│  Mi Cuenta                           │
│  Mis Pedidos                         │
│  Cerrar Sesión                       │
└──────────────────────────────────────┘
```

---

## 📝 PASOS DE IMPLEMENTACIÓN

### PASO 1: Ejecutar SQL en Supabase (30 min)

1. Ve a: https://app.supabase.com
2. Selecciona tu proyecto
3. SQL Editor → New Query
4. Copia contenido de `ZAPATOS_PREMIUM_COMPLETO.sql`
5. Ejecuta (Ctrl+Enter)
6. Verifica: sin errores

---

### PASO 2: Crear Usuarios en Supabase Auth (15 min)

**Crear usuario administrador:**
1. Dashboard → Authentication → Users
2. Click "Create new user"
3. Email: `admin@zapatos.com`
4. Password: `Admin123!`
5. Click "Create user"

**Crear usuario regular:**
1. Repite pero con:
   - Email: `usuario@zapatos.com`
   - Password: `User123!`

---

### PASO 3: Convertir a Admin (10 min)

Ejecuta este SQL en Supabase:

```sql
UPDATE user_profiles 
SET is_admin = true 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@zapatos.com'
);
```

---

### PASO 4: Crear Storage Bucket (10 min)

1. Dashboard → Storage
2. Create new bucket
3. Name: `products-images`
4. Make it Public ✓
5. Create

---

### PASO 5: Crear Rutas API para Favoritos (30 min)

Archivo: `src/pages/api/favorites/[id].ts`

```typescript
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

// GET - check if favorite
// DELETE - remove favorite
// POST - add favorite (en raíz /api/favorites/)

export const POST: APIRoute = async ({ params, request }) => {
  const userId = request.headers.get('Authorization')?.replace('Bearer ', '');
  const { id } = params;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const { error } = await supabase
    .from('favorites')
    .insert([
      {
        user_id: userId,
        product_id: id,
      },
    ]);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 201,
  });
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const userId = request.headers.get('Authorization')?.replace('Bearer ', '');
  const { id } = params;

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
};
```

Archivo: `src/pages/api/favorites/check.ts`

```typescript
import type { APIRoute } from 'astro';
import { supabase } from '@lib/supabase';

export const GET: APIRoute = async ({ url, request }) => {
  const userId = request.headers.get('Authorization')?.replace('Bearer ', '');
  const productId = url.searchParams.get('productId');

  if (!userId || !productId) {
    return new Response(JSON.stringify({ isFavorite: false }), {
      status: 200,
    });
  }

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  return new Response(JSON.stringify({ isFavorite: !!data }), {
    status: 200,
  });
};
```

---

### PASO 6: Actualizar Componentes (10 min)

Ya incluidos:
- ✅ `UserMenu.tsx` - Muestra/oculta botones según autenticación
- ✅ `AddToCartButton.tsx` - Requiere autenticación
- ✅ `AddToFavoritesButton.tsx` - Nuevo, requiere autenticación

---

## 🧪 TESTING

### Test 1: Usuario Anónimo
```
1. Abre http://localhost:3000
2. Navega a /productos
3. Intenta agregar a favoritos → Te pide iniciar sesión ✓
4. Intenta agregar al carrito → Te pide iniciar sesión ✓
5. Ves botón "Iniciar Sesión" en header ✓
```

### Test 2: Usuario Autenticado
```
1. Haz login: usuario@zapatos.com / User123!
2. El botón de "Iniciar Sesión" cambia a "👤 Usuario" ✓
3. Click en "👤 Usuario" muestra menú dropdown ✓
4. Opciones: Mi Cuenta, Mis Pedidos, Cerrar Sesión ✓
5. Ahora SÍ puedes agregar a favoritos ✓
6. Ahora SÍ puedes agregar al carrito ✓
7. Click "Cerrar Sesión" te desconecta ✓
```

### Test 3: Admin
```
1. Haz login: admin@zapatos.com / Admin123!
2. Navegación normal (igual que usuario regular)
3. Accede a /admin/productos (debería funcionar)
4. Ver productos en listado
5. Crear nuevo producto (formulario aparece)
```

---

## 📊 ESTRUCTURA DE DATOS

### user_profiles
```typescript
{
  id: UUID,                    // Referencia a auth.users
  full_name?: string,
  phone?: string,
  avatar_url?: string,
  address?: string,
  city?: string,
  state?: string,
  postal_code?: string,
  country?: string,
  is_admin: boolean,           // true = puede gestionar productos
  is_active: boolean,          // true = cuenta activa
  created_at: timestamp,
  updated_at: timestamp
}
```

### favorites
```typescript
{
  id: UUID,
  user_id: UUID,               // Referencia a auth.users
  product_id: UUID,            // Referencia a products
  created_at: timestamp
}
```

### cart_items
```typescript
{
  id: UUID,
  user_id: UUID,
  product_id: UUID,
  size: string,                // "36", "37", etc.
  quantity: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## 🔒 SEGURIDAD

### Políticas RLS Aplicadas
```
✅ Productos: Lectura pública, escritura solo admin
✅ Favoritos: Solo usuario propietario puede ver/editar sus favoritos
✅ Carrito: Solo usuario propietario puede ver/editar su carrito
✅ Órdenes: Solo usuario propietario puede ver sus órdenes
✅ Reviews: Lectura pública, escritura usuarios autenticados
```

### Autenticación
```
✅ Session-based con Supabase Auth
✅ JWT en localStorage
✅ Verificación en middleware
✅ Auto-logout si sesión expira
```

---

## 📱 FLUJO DE USUARIO

### Primer Acceso (Anónimo)
```
1. Visitante llega a homepage
2. Navega catálogo (todo visible)
3. Intenta agregar favorito → "Inicia sesión"
4. Click botón "Iniciar Sesión"
5. Login o registro
```

### Con Sesión
```
1. Usuario inicia sesión
2. Botón "Iniciar Sesión" → "👤 Usuario" (con nombre)
3. Puede agregar favoritos
4. Puede agregar al carrito
5. Puede ver mi cuenta, pedidos
6. Click "Cerrar Sesión" → Desconecta
```

---

## ✅ CHECKLIST

- [ ] Ejecutar ZAPATOS_PREMIUM_COMPLETO.sql
- [ ] Crear usuario admin en Supabase Auth
- [ ] Crear usuario regular en Supabase Auth
- [ ] Convertir usuario admin a is_admin = true
- [ ] Crear bucket "products-images" en Storage
- [ ] Crear rutas API para favoritos
- [ ] npm run build (sin errores)
- [ ] npm run dev (testing local)
- [ ] Test usuario anónimo
- [ ] Test usuario autenticado
- [ ] Test admin
- [ ] Verificar RLS en Supabase

---

## 🐛 TROUBLESHOOTING

### Error: "RLS policy prevents access"
**Solución:** Ejecuta el SQL completo incluyendo políticas RLS

### Error: "User not found in profile"
**Solución:** El trigger automático debe crear perfil. Si falla:
```sql
INSERT INTO user_profiles (id, is_admin, is_active)
VALUES ('[user-id-aqui]', false, true);
```

### El botón de favorito no funciona
**Solución:** Verifica que la ruta API `/api/favorites/[id].ts` existe

### Favoritos no se guardan
**Solución:** Comprueba en Supabase que:
- Tabla `favorites` existe
- Usuario está autenticado (tiene session token)
- RLS permite al usuario insertar

---

## 📞 RECURSOS

| Recurso | URL |
|---------|-----|
| Supabase Auth | https://supabase.com/docs/guides/auth |
| RLS Policies | https://supabase.com/docs/guides/auth/row-level-security |
| Astro API Routes | https://docs.astro.build/en/guides/endpoints |

---

## 🎯 PRÓXIMAS MEJORAS

- [ ] Reset password
- [ ] Verificación de email
- [ ] Rol de moderador
- [ ] Notificaciones por email
- [ ] 2FA (autenticación de dos factores)
- [ ] OAuth (Google, GitHub login)

---

**¡Estás listo! 🚀**

Próximo paso: Ejecuta `ZAPATOS_PREMIUM_COMPLETO.sql` en Supabase
