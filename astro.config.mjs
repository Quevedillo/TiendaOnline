import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // En Astro 5.0, 'static' es el modo por defecto
  // Las rutas SSR se marcan individualmente con export const prerender = false
  // Rutas SSG (prerender = true): /, /productos, /categoria/[slug], etc.
  // Rutas SSR (prerender = false): /admin, /carrito, /pedidos
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: true,
      nesting: true,
    }),
  ],
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  },
});
