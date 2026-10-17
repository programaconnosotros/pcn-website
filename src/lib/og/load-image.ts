import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { safeFetch } from '@/lib/safe-fetch';

// Satori (behind next/og) can only decode PNG and JPEG; WebP and AVIF photos fall back.
const SUPPORTED_TYPES: Record<string, string> = {
  'image/png': 'image/png',
  'image/jpeg': 'image/jpeg',
  'image/jpg': 'image/jpeg',
};
const EXTENSION_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};
const MAX_BYTES = 3 * 1024 * 1024;
const TIMEOUT_MS = 3000;

const toDataUrl = (buffer: ArrayBuffer | Buffer, type: string) =>
  `data:${type};base64,${Buffer.from(buffer as ArrayBuffer).toString('base64')}`;

/**
 * Loads a picture for a generated card as a data URL: remote URLs are fetched, site paths are
 * read from `public/`. Returns null for unsupported formats, oversized files or any failure,
 * so the card can fall back to initials instead of failing to render.
 */
export async function loadCardImage(src: string | null | undefined): Promise<string | null> {
  if (!src) return null;

  try {
    if (/^https?:\/\//.test(src)) {
      // La foto de un perfil es una URL que eligió su dueño: safeFetch no deja que apunte a la red
      // interna y corta la descarga pasados MAX_BYTES.
      const response = await safeFetch(src, { timeoutMs: TIMEOUT_MS, maxBytes: MAX_BYTES });
      const type = SUPPORTED_TYPES[response.headers.get('content-type')?.split(';')[0] ?? ''];
      if (!response.ok || !type || !response.body) return null;
      return toDataUrl(response.body, type);
    }

    if (src.startsWith('/')) {
      const type = EXTENSION_TYPES[extname(src).toLowerCase()];
      const publicDir = join(process.cwd(), 'public');
      const file = normalize(join(publicDir, decodeURIComponent(src)));
      if (!type || !file.startsWith(publicDir)) return null;
      const buffer = await readFile(file);
      return buffer.byteLength <= MAX_BYTES ? toDataUrl(buffer, type) : null;
    }
  } catch {
    // Network error, timeout or missing file: render without the picture.
  }

  return null;
}
