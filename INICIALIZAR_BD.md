# Inicializar Base de Datos en Supabase

## Problema Actual
- ✅ Login/Registro funciona
- ✅ Redirección post-login está arreglada
- ❌ **No aparecen productos** - La BD necesita ser inicializada

## Solución

### Paso 1: Acceder a Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto
4. Ve a **SQL Editor** (en el menú izquierdo)

### Paso 2: Ejecutar Scripts SQL

**En orden:**

#### Primero: `database.sql`
1. Copia el contenido completo de `database.sql`
2. Crea una **nueva consulta** en SQL Editor
3. Pega el contenido
4. Haz clic en **Ejecutar** (Play button)
5. Espera a que termine ✓

#### Segundo: `auth-setup.sql`
1. Copia el contenido completo de `auth-setup.sql`
2. Crea una **nueva consulta** en SQL Editor
3. Pega el contenido
4. Haz clic en **Ejecutar**
5. Espera a que termine ✓

### Paso 3: Verificar Datos

Una vez ejecutados los scripts:
1. Ve a **Table Editor** en Supabase
2. Verifica que existan las tablas:
   - ✓ `categories` (3 categorías: Camisas, Pantalones, Trajes)
   - ✓ `products` (3 productos: Camisa Oxford, Pantalón Chino, Traje Gris)
   - ✓ `profiles`
   - ✓ `admin_users`

### Paso 4: Probar la Aplicación

Después de inicializar la BD:
1. Ejecuta `npm run dev` en tu terminal
2. Ve a `http://localhost:3000`
3. El login debería redirigir a la home
4. Los productos deberían aparecer en `/productos`

## ¿Problemas?

Si ves errores en Supabase SQL Editor:
- **"relation does not exist"**: Asegúrate de ejecutar `database.sql` ANTES de `auth-setup.sql`
- **"duplicate key"**: Es normal, significa que ya existe. Ignora el error
- **"permission denied"**: Verifica que estés usando la cuenta correcta

## Alternativa: Usar Bash Script (Recomendado)

Si tienes `psql` instalado, puedes ejecutar directamente:

```bash
psql -h tu-supabase-db.supabase.co -U postgres -d postgres -f database.sql
psql -h tu-supabase-db.supabase.co -U postgres -d postgres -f auth-setup.sql
```

(Reemplaza `tu-supabase-db` con tu instancia)

---

**Una vez completado esto, ¡tu tienda estará lista! ✨**
