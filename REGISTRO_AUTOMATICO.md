# ✅ SISTEMA DE REGISTRO AUTOMÁTICO - LISTO

**Compilación:** ✅ Exitosa  
**Rutas API creadas:** ✅ 3 nuevas rutas  
**Usuarios:** ✅ Se crean automáticamente desde el registro

---

## 🎯 ¿Qué se hizo?

### 1️⃣ **Rutas API Creadas**

#### `POST /api/auth/register`
- Registra nuevo usuario en Supabase Auth
- Valida email y contraseña
- Crea automáticamente perfil en `user_profiles` (via trigger SQL)
- Retorna: `{ success: true, user: { id, email } }`

#### `POST /api/auth/login`
- Inicia sesión con email/password
- Guarda token en cookies (httpOnly, secure)
- Retorna: `{ success: true, user: { id, email } }`

#### `POST /api/auth/logout`
- Borra cookies de sesión
- Cierra sesión en Supabase
- Retorna: `{ success: true }`

---

## 🚀 PASOS AHORA

### PASO 1: Probar localmente

```bash
cd c:\Users\jgomq\Desktop\tiendaOnline
npm run dev
```

Abre http://localhost:3000/auth/login

### PASO 2: Registrarse

```
Email: usuario@zapatos.com
Contraseña: User123!
Nombre: Juan

Click: REGISTRARSE
```

**¿Qué pasa?**
1. ✅ Se envía a `/api/auth/register`
2. ✅ Supabase crea usuario en `auth.users`
3. ✅ Trigger SQL crea automáticamente perfil en `user_profiles`
4. ✅ Redirige a `/` (home)
5. ✅ UserMenu muestra `👤 Usuario`

### PASO 3: Crear admin

Opción A - Desde el formulario:
```
Email: admin@zapatos.com
Contraseña: Admin123!
Nombre: Admin
```

Opción B - Desde Supabase (más rápido):
```
1. Abre: https://app.supabase.com
2. SQL Editor → New Query
3. Ejecuta:

UPDATE user_profiles 
SET is_admin = true 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@zapatos.com'
);
```

### PASO 4: Probar funcionalidades

#### Como usuario anónimo:
```
1. Home → Ver productos ✓
2. Intentar Agregar favorito
   → "Inicia sesión para guardar favoritos" ✓
3. Intentar Agregar al carrito
   → "Necesitas iniciar sesión" ✓
```

#### Como usuario autenticado:
```
1. Ir a /auth/login
2. Inicia sesión (usuario@zapatos.com)
3. Home → Ver productos ✓
4. Click en ♡ Favorito
   → Debe funcionár (♡ → ♥) ✓
5. Click en Agregar al carrito
   → Debe funcionar ✓
6. Ver menú usuario
   → "👤 usuario@zapatos.com" ✓
7. Click en "Mi Cuenta"
   → Ir a /mi-cuenta ✓
8. Click en "Mis Pedidos"
   → Ir a /pedidos ✓
9. Click en "Cerrar Sesión"
   → Volver a home, botón azul "Iniciar Sesión" ✓
```

#### Como admin:
```
1. Inicia sesión con admin@zapatos.com
2. Ir a /admin
   → Debe funcionar (no redirige a login) ✓
3. Ver "Gestionar Productos"
   → Crear, editar, eliminar productos ✓
```

---

## 🔐 FLUJO DE AUTENTICACIÓN

```
USUARIO ANÓNIMO
    ↓
[Botón: Iniciar Sesión]
    ↓
/auth/login → AuthForm
    ↓
    ├─→ REGISTRARSE
    │   ↓
    │   POST /api/auth/register
    │   ↓
    │   Supabase Auth (crea auth.users)
    │   ↓
    │   Trigger → crea user_profiles
    │   ↓
    │   Redirige a /
    │
    └─→ INICIAR SESIÓN
        ↓
        POST /api/auth/login
        ↓
        Supabase Auth (verifica credenciales)
        ↓
        Guarda token en cookie
        ↓
        Redirige a /
        
USUARIO AUTENTICADO
    ↓
[Botón: 👤 usuario@zapatos.com]
    ↓
    ├─→ Mi Cuenta → /mi-cuenta
    ├─→ Mis Pedidos → /pedidos
    └─→ Cerrar Sesión
        ↓
        POST /api/auth/logout
        ↓
        Borra cookies
        ↓
        Vuelve a usuario anónimo
```

---

## 📝 TAREAS PENDIENTES

### ✅ Completadas
- [x] SQL ejecutado en Supabase
- [x] Tablas y políticas RLS configuradas
- [x] Rutas API de autenticación creadas
- [x] Componentes actualizados (UserMenu, AddToCartButton, etc.)
- [x] Trigger para crear perfil automáticamente
- [x] Compilación exitosa

### ⏳ Pendientes
- [ ] Testear registro (usuario anónimo → usuario)
- [ ] Testear login
- [ ] Testear logout
- [ ] Testear favoritos con usuario autenticado
- [ ] Testear carrito con usuario autenticado
- [ ] Crear usuario admin y testear /admin
- [ ] Crear API de favoritos (/api/favorites/[id].ts)
- [ ] Crear API de carrito persistente
- [ ] Implementar "Mi Cuenta" (editar perfil)
- [ ] Implementar "Mis Pedidos" (listar órdenes)

---

## 🧪 VERIFICACIÓN RÁPIDA

```bash
# 1. Terminal 1: Inicia el servidor
npm run dev

# 2. Terminal 2: Verifica que Supabase está conectado
curl https://fcfwdysdxycscytbuifr.supabase.co/rest/v1/products \
  -H "Authorization: Bearer $(cat .env.local | grep PUBLIC_SUPABASE_ANON_KEY | cut -d'=' -f2)" \
  -H "apikey: $(cat .env.local | grep PUBLIC_SUPABASE_ANON_KEY | cut -d'=' -f2)"

# 3. Abre http://localhost:3000/auth/login en el navegador
```

---

## 🐛 SI ALGO NO FUNCIONA

### Error: "Failed to fetch"
**Causa:** Supabase no responde  
**Solución:** 
1. Verifica que el SQL se ejecutó
2. Verifica que `.env.local` tiene las credenciales correctas
3. Recarga la página

### Error: "User already registered"
**Causa:** Email ya existe en Supabase Auth  
**Solución:** 
- Usa un email diferente
- O borra el usuario desde: Supabase Dashboard → Authentication → Users

### Error: "Invalid login credentials"
**Causa:** Email/password incorrectos  
**Solución:** 
- Verifica que las credenciales sean correctas
- Asegúrate de que el usuario existe en Supabase Auth

### Favorito no funciona
**Causa:** API `/api/favorites/[id].ts` no existe  
**Solución:** Ver USUARIOS_AUTENTICACION.md (PASO 5)

---

## 📊 BASE DE DATOS ACTUAL

### Tablas creadas
- ✅ `categories` (4 categorías: Basketball, Lifestyle, Running, Limited)
- ✅ `products` (3 productos de ejemplo)
- ✅ `user_profiles` (se crea automáticamente al registrarse)
- ✅ `favorites` (para productos favoritos)
- ✅ `cart_items` (carrito persistente)
- ✅ `product_reviews` (reviews de usuarios)
- ✅ `orders` (historial de órdenes)
- ✅ `order_items` (items en cada orden)
- ✅ `restock_alerts` (notificaciones de restock)

### Políticas RLS
- ✅ Productos: Lectura pública, escritura solo admin
- ✅ Categorías: Lectura pública
- ✅ Favoritos: Solo usuarios autenticados
- ✅ Carrito: Solo usuarios autenticados
- ✅ Órdenes: Solo usuario propietario

---

## 🎯 SIGUIENTE PASO

```bash
npm run dev
```

Abre http://localhost:3000/auth/login y **registra un usuario nuevo** ✨

¿Funcionó? Cuéntame qué pasa.

