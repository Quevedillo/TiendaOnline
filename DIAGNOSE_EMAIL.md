# 🔍 DIAGNÓSTICO: Por qué no funciona el email

## 📋 Pasos para Diagnosticar

### PASO 1: Verificar Consola del Servidor
1. En VS Code, mira la consola donde está corriendo `npm run dev`
2. Busca mensajes con ✅ o ❌
3. **Copia los errores exactos que ves**

### PASO 2: Ejecutar Test de Resend
1. En otra terminal, ve a la raíz del proyecto
2. Ejecuta:
   ```bash
   node test-resend.mjs
   ```
3. Esto enviará un email de prueba a: `jgomez.quesada@gmail.com`
4. Mira la respuesta en consola (incluirá errores si los hay)

### PASO 3: Verificar Email
1. Revisa tu inbox en Gmail
2. **MUY IMPORTANTE**: Mira en la carpeta **SPAM/PROMOTIONS**
3. Si lo ves ahí, marca como "No es spam"

---

## 🐛 Problemas Comunes

### ❌ "Error: invalid_api_token"
- La API key no es válida o expiró
- Solución: Copia una nueva key de https://resend.com/api-keys

### ❌ "Error: invalid_from_address"
- El "from" no está verificado en Resend
- Por ahora usa: `onboarding@resend.dev` (ya incluido en el código)

### ❌ "Error: invalid_to_address"
- El email destino es inválido
- Verifica que sea un email real

### ❌ No aparece en inbox
- ✅ Mira en SPAM/PROMOTIONS
- ✅ Marca como "No es spam"

---

## 📝 Qué Información Necesito

Después de hacer esto, dame:
1. **El output completo** de ejecutar `node test-resend.mjs`
2. **Los errores que ves** en la consola de `npm run dev`
3. **Si recibiste o no** el email de prueba

Con esto podré resolver el problema exacto. 🚀
