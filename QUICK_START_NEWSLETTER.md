# 🚨 CONFIGURACIÓN REQUERIDA: Newsletter

## ⚠️ Tu sistema de newsletter está **casi listo**, pero necesita 1 configuración:

---

## 🔑 PASO 1: Obtener tu API Key de Resend (5 minutos)

### ¿Qué es Resend?
Es un servicio GRATUITO para enviar emails. Es el que usaremos para notificar a tus clientes.

### Pasos:

1. **Abre** https://resend.com
2. **Haz clic** en "Sign Up" (Registrarse)
3. **Completa** tu email y crea contraseña
4. **Verifica** tu email
5. **Inicia sesión** en https://resend.com/dashboard
6. **Ve** a "API Keys" (en el menú izquierdo)
7. **Copia** la clave que comienza con `re_`

### Ejemplo:
Tu clave se verá así: `re_abc123def456ghi789jkl0123456`

---

## 📝 PASO 2: Agregar la clave al proyecto

### En la raíz del proyecto abre el archivo: `.env.local`

Busca esta línea:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Reemplaza `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx` con tu clave real:
```
RESEND_API_KEY=re_abc123def456ghi789jkl0123456
```

### Guarda el archivo (Ctrl+S)

---

## 🔄 PASO 3: Reiniciar el servidor

1. En la terminal, presiona: **Ctrl+C** (para detener el servidor)
2. Luego escribe: `npm run dev`
3. Espera a que diga "Server running at..."

---

## 📊 PASO 4: Ejecutar SQL en Supabase

Abre el archivo `SETUP_NEWSLETTER_RLS.sql` en tu editor.

1. Selecciona TODO el contenido (Ctrl+A)
2. Copia (Ctrl+C)
3. Ve a https://app.supabase.com → Tu proyecto
4. Ve a **SQL Editor** → **New Query**
5. Pega el contenido (Ctrl+V)
6. Haz clic en **"Run"** (botón azul)

Deberías ver: ✅ "Success" al final

---

## ✅ LISTO! 

Tu newsletter está configurado. Ahora:

### Prueba suscripción:
1. Ve a tu sitio: http://localhost:3000
2. Baja hasta la sección "No te pierdas ningún DROP"
3. Escribe tu email
4. Haz clic en "Suscribirse"
5. Revisa tu email (busca en SPAM si no ves)

### Prueba creación de producto:
1. Ve a http://localhost:3000/admin
2. Ve a **Productos** → **Nuevo Producto**
3. Rellena los datos y crea el producto
4. ¡Todos los suscriptores recibirán un email! 🎉

---

## 📚 Documentación

- **Guía Completa**: [NEWSLETTER_COMPLETE_GUIDE.md](NEWSLETTER_COMPLETE_GUIDE.md)
- **Setup de SQL**: [SETUP_NEWSLETTER_RLS.sql](SETUP_NEWSLETTER_RLS.sql)
- **Setup de BD**: [SETUP_DATABASE.sql](SETUP_DATABASE.sql)

---

## 🆘 Si algo no funciona

### Verifica en este orden:

1. ❌ **No llega email de suscripción**
   - ✅ ¿Está bien copia la clave en `.env.local`?
   - ✅ ¿Reiniciaste el servidor?
   - ✅ ¿El email está en SPAM/JUNK?

2. ❌ **Error: "Missing API key"**
   - ✅ La clave no está en `.env.local`
   - ✅ Verifica que NO haya espacios extra

3. ❌ **No se envía email a suscriptores**
   - ✅ ¿Ejecutaste el SQL de Supabase?
   - ✅ ¿Tienes suscriptores verificados?
   - ✅ Revisa la consola para errores

---

**¡Felicidades!** Tu sistema de newsletter está listo para usar. 🚀
