# 📧 Configuración del Servicio de Newsletter con Resend

## 🚀 Pasos para configurar Resend (servicio de email)

### 1. **Crear cuenta en Resend**
   - Ve a: https://resend.com
   - Haz clic en "Sign Up" (Registrarse)
   - Completa tu email y contraseña
   - Verifica tu cuenta

### 2. **Obtener la API Key**
   - Inicia sesión en tu dashboard: https://resend.com/dashboard
   - Ve a la sección "API Keys"
   - Copia la clave que comienza con `re_`

### 3. **Configurar en tu proyecto**
   - Abre el archivo `.env.local` en la raíz del proyecto
   - Busca la línea `RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Reemplaza `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` con tu clave real
   - **Ejemplo:**
     ```
     RESEND_API_KEY=re_abc123def456ghi789jkl
     ```

### 4. **Configurar el dominio de envío** (Importante)
   
   **Opción A: Usar dominio predeterminado (RECOMENDADO para empezar)**
   - Por ahora, Resend te proporciona un dominio gratuito como: `onboarding@resend.dev`
   - Úsalo mientras configuras tu tienda
   - Los emails se verán profesionales igual
   
   **Opción B: Usar tu propio dominio (si lo tienes)**
   - Si tienes el dominio `kickspremium.com` registrado:
     1. En Resend, ve a "Domains"
     2. Click "Add Domain"
     3. Escribe: `kickspremium.com`
     4. Resend te mostrará registros DNS para agregar
     5. Ve a tu proveedor de dominio (GoDaddy, Namecheap, etc)
     6. Agrega los registros DNS que Resend proporciona
     7. Espera a que se verifique (puede tardar 24-48h)
   
   **⚠️ Si no tienes el dominio registrado:**
   - Regístralo primero en: https://www.namecheap.com o https://www.godaddy.com
   - Luego sigue los pasos de Opción B

### 5. **Actualizar email de admin (opcional)**
   - En `.env.local`, hay una variable `ADMIN_EMAIL`
   - Cambiarla al email donde quieres recibir notificaciones
   - **Ejemplo:**
     ```
     ADMIN_EMAIL=tu_email@gmail.com
     ```

### 6. **Verificar que funciona**
   - Reinicia el servidor de desarrollo: `npm run dev`
   - Intenta suscribirte al newsletter desde el sitio
   - Deberías recibir un email de confirmación

---

## 📋 Tabla de resumen

| Variable | Donde obtenerla | Descripción |
|----------|-----------------|-------------|
| `RESEND_API_KEY` | https://resend.com/dashboard/api-keys | Clave de API de Resend (empieza con `re_`) |
| `ADMIN_EMAIL` | Tu email | Email donde recibir notificaciones de admin |

---

## ⚙️ Funcionamiento del Newsletter

### Cuando alguien se suscribe:
1. ✅ El email se guarda en la BD (tabla `newsletter_subscribers`)
2. 📧 Resend envía un email de bienvenida
3. 🎯 El usuario puede darse de baja desde cualquier email

### Cuando creas un nuevo producto (admin):
1. ✅ El producto se guarda en la BD
2. 📧 Resend envía automáticamente un email a **todos los suscriptores**
3. 🚀 Los emails se envían en lotes de 10 para evitar rate limits

### Cuando alguien se da de baja:
1. ✅ El email se elimina de la BD
2. ✅ Ya no recibirá emails de nuevos productos

---

## 🔒 Seguridad

- **Nunca** compartas tu `RESEND_API_KEY`
- Está guardada en `.env.local` (no se sube a git)
- El archivo `.gitignore` ya excluye `.env.local`

---

## ❓ Ayuda

Si tienes problemas:
1. Verifica que la clave esté correcta en `.env.local`
2. Reinicia el servidor: `Ctrl+C` y `npm run dev`
3. Revisa los logs en la consola para errores
4. Asegúrate de que tu cuenta de Resend esté verificada

---

## 📊 Estadísticas

Para ver cuántos suscriptores tienes:
- Ve al panel de admin: `/admin`
- Necesita permisos de administrador

O usa el endpoint: `GET /api/admin/newsletter`

