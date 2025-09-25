# 🖼️ Image Upload System - Spoon Platform

Sistema completo de subida de imágenes para restaurantes usando Supabase Storage.

## ✅ **ESTADO: COMPLETAMENTE IMPLEMENTADO**

### **Funcionalidades Implementadas:**
- ✅ **Subida de Logo** (máx 2MB, PNG/JPG/WebP)
- ✅ **Subida de Portada** (máx 5MB, PNG/JPG/WebP)
- ✅ **Validación de archivos** (tipo, tamaño, formato)
- ✅ **URLs públicas persistentes** en Supabase Storage
- ✅ **Políticas RLS** de seguridad
- ✅ **UI completa** en ImagenesForm.tsx
- ✅ **Manejo de errores** detallado
- ✅ **Feedback visual** (loading, success, error)

---

## 🏗️ **Arquitectura Implementada**

### **1. UI Component (`ImagenesForm.tsx`)**
```typescript
// ✅ FUNCIONALIDAD COMPLETA
- Drag & drop interface
- File validation (type, size)
- Loading states
- Error handling
- Preview images
- Remove functionality
```

### **2. Service Layer (`RestaurantService.uploadRestaurantImage`)**
```typescript
// ✅ LÓGICA DE SUBIDA
- Authentication check
- Restaurant ownership validation
- File processing & naming
- Supabase Storage integration
- Error handling & user feedback
```

### **3. Storage Layer (`storage.ts`)**
```typescript
// ✅ UTILIDADES DE STORAGE
- File upload with metadata
- Public URL generation
- Path building helpers
- Error handling
```

### **4. Database Policies (SQL)**
```sql
-- ✅ POLÍTICAS RLS COMPLETAS
- Upload permissions (restaurant owners only)
- Update permissions (owners only)
- Delete permissions (owners only)
- Public read access (for display)
```

---

## 🔧 **Configuración Necesaria**

### **1. Ejecutar SQL Script**
Ve a tu **Supabase Dashboard → SQL Editor** y ejecuta:

```bash
# Archivo: scripts/setup-storage-bucket.sql
```

Este script crea:
- ✅ Bucket `restaurant-images`
- ✅ Políticas RLS de seguridad
- ✅ Configuración de límites y tipos

### **2. Verificar Variables de Entorno**
Asegúrate de que estas variables estén configuradas:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Para admin operations
```

---

## 📱 **Cómo Usar en la UI**

### **En ImagenesForm.tsx (YA IMPLEMENTADO)**
```typescript
// ✅ SUBIDA AUTOMÁTICA
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setUploading(type);

    // ✅ SUBIDA REAL A SUPABASE
    const { url } = await RestaurantService.uploadRestaurantImage({ file, type });

    // ✅ ACTUALIZACIÓN DE ESTADO
    setImageUrls(prev => ({
      ...prev,
      [type === 'logo' ? 'logo_url' : 'cover_image_url']: url
    }));

    toast.success('Imagen subida correctamente');
  } catch (error) {
    toast.error(error.message || 'Error subiendo imagen');
  } finally {
    setUploading(null);
  }
};
```

### **Guardar Cambios**
```typescript
// ✅ PERSISTIR URLs EN BASE DE DATOS
const handleSave = async () => {
  const { data, error } = await RestaurantService.updateImages(imageUrls);
  if (error) throw error;
  toast.success('Imágenes guardadas');
};
```

---

## 🔒 **Seguridad Implementada**

### **Políticas RLS**
```sql
-- Solo propietarios pueden subir a su restaurante
CREATE POLICY "Users can upload restaurant images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'restaurant-images'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM restaurants WHERE owner_id = auth.uid()
    )
  );
```

### **Validaciones**
- ✅ **Autenticación requerida**
- ✅ **Propiedad del restaurante verificada**
- ✅ **Tipos de archivo permitidos**
- ✅ **Límites de tamaño**
- ✅ **Nombres de archivo seguros**

---

## 📁 **Estructura de Archivos**

### **Path Structure:**
```
restaurant-images/
├── restaurants/
│   ├── {restaurantId}/
│   │   ├── logo/
│   │   │   ├── 1643723400000-abc123-logo.png
│   │   │   └── 1643723500000-def456-logo.jpg
│   │   └── cover/
│   │       ├── 1643723600000-ghi789-cover.jpg
│   │       └── 1643723700000-jkl012-cover.png
```

### **URL Pública:**
```
https://your-project.supabase.co/storage/v1/object/public/restaurant-images/restaurants/{restaurantId}/{type}/{filename}
```

---

## 🧪 **Testing**

### **Verificar Funcionamiento:**
1. ✅ Ir a **Dashboard → Configuración → Imágenes**
2. ✅ **Subir logo** (PNG/JPG/WebP, máx 2MB)
3. ✅ **Subir portada** (PNG/JPG/WebP, máx 5MB)
4. ✅ **Guardar cambios**
5. ✅ **Ver imágenes** en otras partes de la app

### **Casos de Error:**
- ❌ **Archivo muy grande** → Error claro
- ❌ **Tipo no permitido** → Error claro
- ❌ **Sin autenticación** → Redirección a login
- ❌ **Bucket no existe** → Mensaje para ejecutar SQL

---

## 🚀 **Características Avanzadas**

### **Optimización de Rendimiento:**
- ✅ **Nombres únicos** (timestamp + random)
- ✅ **Cache control** (3600s)
- ✅ **CDN automático** de Supabase

### **Experiencia de Usuario:**
- ✅ **Drag & drop** interface
- ✅ **Preview** antes de subir
- ✅ **Loading states** visuales
- ✅ **Toast notifications** de éxito/error
- ✅ **Remove functionality**

### **Manejo de Errores:**
- ✅ **Mensajes específicos** por tipo de error
- ✅ **Fallbacks** para casos edge
- ✅ **Logging** detallado para debugging

---

## 🔄 **Próximas Expansiones**

### **Posibles Mejoras:**
- 📸 **Compresión automática** de imágenes
- 🖼️ **Generación de thumbnails**
- 📱 **Optimización móvil** (WebP automático)
- 🔄 **Reemplazo sin downtime**
- 📊 **Analytics de uso** de storage

---

## 🎉 **Resultado Final**

**¡Image Upload System completamente funcional!**

✅ **Subida real** a Supabase Storage
✅ **URLs persistentes** y públicas
✅ **Seguridad total** con RLS
✅ **UI moderna** y responsiva
✅ **Validaciones robustas**
✅ **Manejo de errores** completo
✅ **Documentación** detallada

**Los usuarios ahora pueden subir logos y portadas de sus restaurantes de forma segura y eficiente.** 🚀
