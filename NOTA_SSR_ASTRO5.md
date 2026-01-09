# 🔧 NOTA: SSR en Astro 5.0

## Cambio Importante

En **Astro 5.0**, el modo `output: 'hybrid'` ha sido removido.

En su lugar, usamos:
- **Default:** `output: 'static'` (todas las rutas son SSG)
- **Marcar rutas SSR:** Agregar `export const prerender = false` en las páginas

---

## Cómo Marcar Rutas como SSR

### Rutas que SERÁN COMPILADAS (SSG - Prerender):
```
✅ / (homepage)
✅ /productos
✅ /productos/[slug]
✅ /categoria/[slug]
✅ /auth/login
```

Sin necesidad de marcar nada.

---

### Rutas que DEBEN SER SSR (Renderizado Dinámico):
Agregar esta línea al inicio de la página:

```astro
---
export const prerender = false;  // Esta página se renderiza en servidor

// Resto del código...
---
```

**Páginas a marcar como SSR (`prerender = false`):**

1. **src/pages/admin/index.astro**
   ```astro
   ---
   export const prerender = false;
   // Admin dashboard - necesita verificar sesión en tiempo real
   ---
   ```

2. **src/pages/admin/login.astro**
   ```astro
   ---
   export const prerender = false;
   // Admin login - requiere procesamiento de formulario
   ---
   ```

3. **src/pages/admin/productos/index.astro**
   ```astro
   ---
   export const prerender = false;
   // Listado de productos para admin - datos dinámicos
   ---
   ```

4. **src/pages/admin/productos/nuevo.astro**
   ```astro
   ---
   export const prerender = false;
   // Formulario de nuevo producto - SSR para seguridad
   ---
   ```

5. **src/pages/carrito.astro**
   ```astro
   ---
   export const prerender = false;
   // Carrito - datos persistentes del usuario
   ---
   ```

6. **src/pages/mi-cuenta.astro**
   ```astro
   ---
   export const prerender = false;
   // Mi cuenta - datos personales del usuario
   ---
   ```

7. **src/pages/pedidos.astro**
   ```astro
   ---
   export const prerender = false;
   // Historial de pedidos - datos dinámicos del usuario
   ---
   ```

---

## Verificación

Después de agregar `export const prerender = false`, compila:

```bash
npm run build
```

Deberías ver en la salida:
```
✓ Completed in XXms

[200] GET  /admin
[200] GET  /admin/login
[200] GET  /carrito
[200] GET  /mi-cuenta
[200] GET  /pedidos

2 routes (SSG)
5 routes (SSR on-demand)
```

---

## Alternativa: Usar Rutas API

Si prefieres, también puedes usar rutas API (functions) para manejar SSR:

```
src/pages/api/
├── auth/
│   ├── login.ts
│   └── logout.ts
├── products/
│   ├── list.ts
│   └── [id].ts
└── admin/
    ├── dashboard.ts
    └── products.ts
```

Pero la opción más simple es marcar páginas con `prerender = false`.

---

## Documentación Oficial

- [Astro SSR](https://docs.astro.build/en/guides/server-side-rendering/)
- [Prerender](https://docs.astro.build/en/reference/configuration-reference/#prerender)

