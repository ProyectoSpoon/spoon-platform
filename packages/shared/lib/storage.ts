// Unified Storage Service (Supabase-first, pluggable)
import { supabase, supabaseAdmin } from './supabase';

export interface UploadParams {
  bucket: string;
  /** Target path inside the bucket, e.g. `restaurants/{id}/logo.png` */
  path: string;
  /** File/blob/buffer-like payload. Prefer Blob/File in browser. */
  body: Blob | ArrayBuffer | Uint8Array;
  contentType?: string;
  cacheControl?: string | number; // e.g. '3600'
  upsert?: boolean; // default: true
  makePublic?: boolean; // when true, returns publicUrl if bucket is public
}

export interface UploadResult {
  bucket: string;
  path: string;
  publicUrl?: string | null;
}

export interface UrlParams {
  bucket: string;
  path: string;
}

export interface DeleteParams {
  bucket: string;
  path: string | string[];
}

export interface EnsureBucketOptions {
  public?: boolean; // default true for our use cases (logos/images)
  fileSizeLimit?: string; // e.g. '10MB'
  allowedMimeTypes?: string[];
}

export interface StorageService {
  ensureBucket(name: string, options?: EnsureBucketOptions): Promise<void>;
  uploadFile(params: UploadParams): Promise<UploadResult>;
  getPublicUrl(params: UrlParams): string;
  deleteFile(params: DeleteParams): Promise<void>;
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Create bucket if missing (requires Service Role key). Must run on server side.
 */
export async function ensureBucket(name: string, options?: EnsureBucketOptions): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('[storage.ensureBucket] Missing SUPABASE_SERVICE_ROLE_KEY (admin client not available). Run this only on server with service role.');
  }
  // Limit to server-side only to avoid exposing service role via SSR mistakes
  if (isBrowser()) {
    throw new Error('[storage.ensureBucket] Do not call from browser. Use server-side/admin tasks.');
  }

  // Check existing bucket
  const existing = await (supabaseAdmin as any).storage.getBucket(name);
  if ((existing as any)?.data) {
    // Already exists: update config if needed
    const { public: isPublic = true, fileSizeLimit, allowedMimeTypes } = options || {};
    await (supabaseAdmin as any).storage.updateBucket(name, {
      public: isPublic ?? true,
      fileSizeLimit,
      allowedMimeTypes,
    } as any);
    return;
  }

  const { public: isPublic = true, fileSizeLimit, allowedMimeTypes } = options || {};
  const { error } = await (supabaseAdmin as any).storage.createBucket(name, {
    public: isPublic,
    fileSizeLimit,
    allowedMimeTypes,
  } as any);
  if (error) throw error;
}

/** Upload a file to a bucket (defaults to upsert true). */
export async function uploadFile({ bucket, path, body, contentType, cacheControl, upsert = true, makePublic }: UploadParams): Promise<UploadResult> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, body as any, {
    contentType,
    cacheControl: cacheControl?.toString(),
    upsert,
  });
  if (error) throw error;
  const result: UploadResult = { bucket, path: (data as any)?.path || path };
  if (makePublic) {
    result.publicUrl = getPublicUrl({ bucket, path: result.path });
  }
  return result;
}

/** Get a public URL (bucket must be public or path must be exposed by policy). */
export function getPublicUrl({ bucket, path }: UrlParams): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return (data as any)?.publicUrl || '';
}

/** Delete one or multiple files. */
export async function deleteFile({ bucket, path }: DeleteParams): Promise<void> {
  const paths = Array.isArray(path) ? path : [path];
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}

export const storageService: StorageService = {
  ensureBucket,
  uploadFile,
  getPublicUrl,
  deleteFile,
};

// Helpers for path & filenames
export function safeFileName(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function buildObjectPath(parts: Array<string | undefined | null>): string {
  return parts
    .filter(Boolean)
    .map((p) => (p as string).replace(/^\/+|\/+$|\s+/g, ''))
    .filter(Boolean)
    .join('/');
}

// Types re-export for external usage
export type { UploadParams as _UploadParams, UploadResult as _UploadResult, UrlParams as _UrlParams, DeleteParams as _DeleteParams };