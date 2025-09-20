// packages/shared/services/specials.ts
import { storageService, buildObjectPath, safeFileName } from '../lib/storage';

/**
 * Upload image for a Special Dish and return its public URL.
 * Keeps a simple string return for easy usage in client UIs.
 */
export async function uploadSpecialDishImage(file: File | Blob, opts?: { specialId?: string }): Promise<string> {
  const bucket = 'special-dishes';
  const originalName = (file as any).name || 'image.jpg';
  const cleaned = safeFileName(originalName);
  const fileName = `${Date.now()}-${cleaned}`;
  const path = opts?.specialId
    ? buildObjectPath(['specials', opts.specialId, fileName])
    : fileName; // fallback flat path

  const { publicUrl } = await storageService.uploadFile({
    bucket,
    path,
    body: file as any,
    contentType: (file as any).type || 'image/jpeg',
    cacheControl: '3600',
    upsert: true,
    makePublic: true,
  });
  if (!publicUrl) throw new Error('No se pudo obtener URL pública');
  return publicUrl;
}
