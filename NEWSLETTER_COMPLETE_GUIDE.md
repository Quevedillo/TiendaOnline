# 📚 Guía Completa del Sistema de Newsletter

## 🎯 Resumen Rápido

Tu tienda ahora tiene un sistema de newsletter completamente funcional que:
- ✅ Permite que usuarios se suscriban
- ✅ Envía emails de bienvenida a nuevos suscriptores
- ✅ Notifica a todos los suscriptores cuando creas un nuevo producto
- ✅ Permite que usuarios se den de baja fácilmente
- ✅ Panel de admin para gestionar suscriptores

---

## 🚀 Primeros Pasos (IMPORTANTE)

### 1. **Configurar Resend**
```bash
1. Ve a https://resend.com
2. Crea una cuenta gratis
3. Copia tu API key (empieza con re_)
4. En .env.local, reemplaza:
   RESEND_API_KEY=re_tu_clave_aqui
5. Reinicia el servidor: Ctrl+C y npm run dev
```

### 2. **Ejecutar SQL en Supabase**
Abre el archivo `SETUP_NEWSLETTER_RLS.sql` y copia todo el contenido:
1. Ve a tu dashboard de Supabase
2. SQL Editor → New Query
3. Pega el contenido
4. Click en "Run"

Esto configura las políticas de seguridad para la tabla de suscriptores.

---

## 📝 Cómo Funciona

### **Flujo de Suscripción**
```
Usuario escribe email en formulario
        ↓
POST /api/newsletter/subscribe
        ↓
Email guardado en BD (verificado=true)
        ↓
Email de bienvenida enviado por Resend
        ↓
Usuario recibe email: "¡Bienvenido a Kicks Premium!"
```

### **Flujo de Nuevo Producto**
```
Admin crea nuevo producto en /admin/productos/nuevo
        ↓
POST /api/admin/products (validación de admin)
        ↓
Producto guardado en BD
        ↓
Se obtiene lista de suscriptores verificados
        ↓
Se envían emails en lotes de 10 (con 1s de espera entre lotes)
        ↓
Respuesta al admin: "Newsletter programado para X suscriptores"
        ↓
Cada suscriptor recibe: "🔥 ¡Nuevo Drop! [Producto]"
```

### **Flujo de Desuscripción**
```
Usuario hace clic en "Darse de baja" en email
        ↓
Llega a /unsubscribe?email=...
        ↓
Usuario confirma y envía formulario
        ↓
POST /api/newsletter/unsubscribe
        ↓
Email eliminado de BD
        ↓
Ya no recibirá emails de nuevos productos
```

---

## 📂 Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| [src/lib/email.ts](src/lib/email.ts) | Funciones de envío de email |
| [src/pages/api/newsletter/subscribe.ts](src/pages/api/newsletter/subscribe.ts) | Endpoint de suscripción |
| [src/pages/api/newsletter/unsubscribe.ts](src/pages/api/newsletter/unsubscribe.ts) | Endpoint de desuscripción |
| [src/pages/api/admin/newsletter/index.ts](src/pages/api/admin/newsletter/index.ts) | Gestión de suscriptores (admin) |
| [src/pages/api/admin/products/index.ts](src/pages/api/admin/products/index.ts) | Crear producto + enviar newsletter |
| [src/pages/unsubscribe.astro](src/pages/unsubscribe.astro) | Página de desuscripción |
| [src/components/NewsletterSection.astro](src/components/NewsletterSection.astro) | Componente del formulario |
| [SETUP_DATABASE.sql](SETUP_DATABASE.sql) | Setup inicial (ya ejecutado) |
| [SETUP_NEWSLETTER_RLS.sql](SETUP_NEWSLETTER_RLS.sql) | Políticas de seguridad |

---

## 🔌 Endpoints de API

### Públicos (sin autenticación)

#### `POST /api/newsletter/subscribe`
Suscribirse al newsletter
```json
{
  "email": "usuario@example.com"
}
```
**Respuesta:**
```json
{
  "success": true,
  "message": "¡Gracias por suscribirte!",
  "subscriber": { "id": "...", "email": "...", "verified": true }
}
```

#### `POST /api/newsletter/unsubscribe`
Desuscribirse
```json
{
  "email": "usuario@example.com"
}
```

---

### Admin (requiere autenticación + permisos de admin)

#### `GET /api/admin/newsletter`
Listar suscriptores
```
Query params:
- verified=true/false (opcional)
- limit=100 (default)
```
**Respuesta:**
```json
{
  "subscribers": [
    { "id": "...", "email": "...", "verified": true, "created_at": "2026-01-13T..." }
  ],
  "stats": {
    "total": 250,
    "verified": 248,
    "unverified": 2
  }
}
```

#### `DELETE /api/admin/newsletter?email=usuario@example.com`
Eliminar un suscriptor

---

## 📧 Plantillas de Email

### 1. **Email de Bienvenida** (se envía al suscribirse)
- Asunto: "¡Bienvenido a Kicks Premium!"
- Contenido: Beneficios del newsletter + botón de acceso
- Incluye: Enlace para darse de baja

### 2. **Email de Nuevo Producto** (se envía a todos los suscriptores)
- Asunto: "🔥 ¡Nuevo Drop! [Nombre del Producto]"
- Contenido: Imagen, descripción, precio, marca
- Badge: "⚡ Edición Limitada" si aplica
- Botón: "Ver Producto →"
- Incluye: Enlace para darse de baja

---

## 🛡️ Validaciones y Seguridad

✅ **Email válido**: Se valida el formato antes de guardar
✅ **Emails únicos**: No permite duplicados
✅ **RLS habilitado**: Solo se pueden ver/modificar propios datos
✅ **Autenticación**: Admin endpoints requieren tokens válidos
✅ **Rate limiting**: Emails enviados en lotes para evitar límites
✅ **Manejo de errores**: Fallos en email no rompen el flujo

---

## 🐛 Solución de Problemas

### **Error: "Missing API key"**
- ❌ No está configurada `RESEND_API_KEY` en `.env.local`
- ✅ Ve a https://resend.com y obtén tu clave
- ✅ Agrega a `.env.local` y reinicia servidor

### **No llegan los emails**
- ✅ Verifica que `RESEND_API_KEY` esté correcta
- ✅ Mira la consola para mensajes de advertencia
- ✅ Verifica que el usuario sea suscriptor "verificado"
- ✅ Revisa spam/junk en el email

### **Tabla newsletter_subscribers no existe**
- ❌ No ejecutaste `SETUP_DATABASE.sql`
- ✅ Ejecuta el archivo SQL en Supabase

### **No puedo eliminar suscriptor como admin**
- ❌ No tienes permisos de admin
- ✅ Verifica que `is_admin=true` en `user_profiles`
- ✅ Ejecuta `SETUP_NEWSLETTER_RLS.sql` para las políticas

---

## 📊 Base de Datos

### Tabla: `newsletter_subscribers`
```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Campos:**
- `id`: UUID único
- `email`: Email del suscriptor (único)
- `verified`: Si ya recibió email de confirmación
- `created_at`: Fecha de suscripción
- `updated_at`: Última actualización

**Índices:**
- `idx_newsletter_email`: Para búsquedas por email
- `idx_newsletter_verified`: Para filtrar verificados
- `idx_newsletter_created_at`: Para ordenar por fecha

---

## 🎨 Personalización

### Cambiar email de remitente
En [src/lib/email.ts](src/lib/email.ts):
```typescript
const FROM_EMAIL = 'noreply@kickspremium.com'; // ← Cambiar aquí
```

### Cambiar email del admin (notificaciones)
En `.env.local`:
```env
ADMIN_EMAIL=mi_email@ejemplo.com
```

### Cambiar número de intentos/lotes
En [src/lib/email.ts](src/lib/email.ts), función `sendNewProductToAllSubscribers`:
```typescript
const BATCH_SIZE = 10; // Emails por lote
const DELAY_BETWEEN_BATCHES = 1000; // Ms entre lotes
```

---

## 📈 Mejoras Futuras

- [ ] Segmentación de suscriptores (por categoría)
- [ ] Análisis de apertura (click tracking)
- [ ] Descuentos exclusivos para suscriptores
- [ ] Preferencias de frecuencia de emails
- [ ] Carrusel de productos en email
- [ ] A/B testing de asuntos

---

## 📞 Soporte

- **Resend Docs**: https://resend.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Astro API**: https://docs.astro.build/api

---

**Última actualización:** 13 de Enero, 2026
**Estado:** ✅ Completamente funcional
