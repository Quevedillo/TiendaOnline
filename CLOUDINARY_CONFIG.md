# Configuración de Cloudinary

## Variables de Entorno

Tu Cloudinary está configurado con estas credenciales:

```env
PUBLIC_CLOUDINARY_CLOUD_NAME=dd1o3cxgv
CLOUDINARY_API_KEY=864671212517855
CLOUDINARY_API_SECRET=OPgxS6jzSpthK1dsnAnabYmCfz0
```

## Estructura de Carpetas en Cloudinary

Las imágenes se organizan en:
- **tienda-online/productos/** - Imágenes de productos

## Funcionalidades Implementadas

### 1. Upload de Imágenes
- **Endpoint:** `POST /api/upload/image`
- **Validación:**
  - Formatos soportados: JPEG, PNG, WebP, GIF
  - Tamaño máximo: 10MB
  - Compresión automática
  - Transformación a WebP

### 2. Optimización Automática

Las imágenes se optimizan automáticamente con:
- **Formato:** WebP (mejor compresión)
- **Calidad:** Auto (Cloudinary ajusta según el dispositivo)
- **Responsive:** Imágenes redimensionadas según el dispositivo

### 3. Librerías de Utilidad

**Archivo:** `src/lib/cloudinary.ts`

#### getCloudinaryUrl(publicId, options)
```typescript
// Uso básico
getCloudinaryUrl('tienda-online/productos/imagen.jpg', {
  width: 800,
  height: 600,
  quality: 'auto',
  format: 'webp'
})

// Opciones disponibles:
- width: número (ancho en px)
- height: número (alto en px)
- quality: 'auto' | número (1-100)
- format: 'webp' | 'jpg' | 'png' | etc
- crop: 'fill' | 'fit' | 'scale' | 'pad'
- gravity: 'auto' | 'face' | 'center' | etc
- aspect_ratio: string (ej: '16:9', '1:1')
```

#### getGalleryImageUrl(publicId)
Optimiza imágenes para galerías (1200x1200, WebP, auto quality)

#### getThumbnailUrl(publicId)
Optimiza para thumbnails (300x300, WebP, auto quality)

#### getResponsiveImageUrls(publicId, sizes)
Genera múltiples tamaños para responsive images
```typescript
const urls = getResponsiveImageUrls('imagen.jpg', [300, 600, 1200])
// Resultado:
// {
//   w300: 'https://res.cloudinary.com/.../w_300...',
//   w600: 'https://res.cloudinary.com/.../w_600...',
//   w1200: 'https://res.cloudinary.com/.../w_1200...'
// }
```

#### getAspectRatioUrl(publicId, aspectRatio)
Mantiene una relación de aspecto específica
```typescript
getAspectRatioUrl('imagen.jpg', '16:9')
getAspectRatioUrl('imagen.jpg', '1:1')
getAspectRatioUrl('imagen.jpg', '4:3')
```

## Componentes

### CloudinaryImageUpload (React)
Componente para subir imágenes con:
- Drag & drop
- Preview en vivo
- Validación de archivos
- Mostrador del progreso
- Soporte para múltiples archivos

**Ubicación:** `src/components/islands/CloudinaryImageUpload.tsx`

**Uso:**
```tsx
<CloudinaryImageUpload 
  client:load 
  maxFiles={5}
  existingImages={[]}
/>
```

### ProductGallery (Astro)
Galería de imágenes de productos con:
- Imagen principal con zoom
- Thumbnails interactivos
- Optimización automática de Cloudinary
- Lazy loading
- WebP format con fallback

**Ubicación:** `src/components/product/ProductGallery.astro`

## Dashboard Admin

El panel de administración permite:

### Crear Producto
1. Ve a `/admin/productos/nuevo`
2. Completa la información
3. Sube imágenes con el componente CloudinaryImageUpload
4. Las imágenes se guardan en Cloudinary automáticamente
5. Las URLs se almacenan en la BD

### Editar Producto
1. Ve a `/admin/productos`
2. Selecciona un producto
3. Puedes añadir nuevas imágenes o eliminar las existentes
4. Las imágenes se actualizan en tiempo real

## Ventajas de usar Cloudinary

✅ **No consume ancho de banda de tu servidor**
- Las imágenes se sirven desde CDN de Cloudinary
- Distribución global automática

✅ **Optimización automática**
- Compresión según dispositivo
- Formato WebP para navegadores modernos
- Fallback a JPG para navegadores antiguos

✅ **Almacenamiento ilimitado (plan gratuito)**
- Hasta 25GB de almacenamiento
- Transformaciones ilimitadas

✅ **Responsive images sin trabajo extra**
- Genera múltiples tamaños automáticamente
- Lazy loading nativo

✅ **Mejor rendimiento**
- Imágenes 50-80% más pequeñas que JPEG
- CDN global
- Caché automático

## Documentación Oficial

- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Transformations](https://cloudinary.com/documentation/image_transformation_reference)

## Próximos Pasos

1. ✅ Subir un producto con imágenes
2. ✅ Verificar que aparezcan en la tienda
3. ✅ Verificar velocidad de carga (dev tools)
4. ✅ Opcionalmente, añadir más transformaciones personalizadas
