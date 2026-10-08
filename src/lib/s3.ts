import {
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuración del cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const S3_BUCKET = process.env.AWS_S3_BUCKET || '';
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL || '';

/**
 * Genera una presigned URL para subir un archivo directamente a S3 desde el frontend
 */
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  folder: string = 'events',
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
  const extension = fileName.split('.').pop() || 'jpg';
  const uniqueFileName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: uniqueFileName,
    ContentType: contentType,
  });

  // URL válida por 5 minutos
  // Firmar host y content-type para que el navegador pueda enviar el content-type correcto
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
    signableHeaders: new Set(['host', 'content-type']),
  });

  return { uploadUrl, fileUrl: publicFileUrl(uniqueFileName), key: uniqueFileName };
}

/** Tope de las imágenes que suben los usuarios (perfil, logos de proyectos, registro). */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * Formulario firmado para que un usuario suba una imagen directo a S3. A diferencia del PUT
 * firmado, S3 rechaza el archivo si pasa de MAX_IMAGE_BYTES, y la extensión sale del tipo y no
 * del nombre que manda el navegador.
 */
export async function getImageUploadForm(contentType: string, folder: string) {
  const extension = IMAGE_EXTENSIONS[contentType];
  if (!extension) throw new Error('Tipo de archivo no permitido');

  const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { url, fields } = await getPresignedPost(key, contentType, MAX_IMAGE_BYTES);

  return { url, fields, fileUrl: publicFileUrl(key) };
}

/** URL pública de un objeto del bucket: por CloudFront si está configurado, o directo a S3. */
export function publicFileUrl(key: string) {
  return CLOUDFRONT_URL
    ? `${CLOUDFRONT_URL}/${key}`
    : `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
}

/** La key de un objeto del bucket a partir de su URL pública, o null si la URL no es del bucket. */
export function keyFromPublicUrl(url: string) {
  const prefix = publicFileUrl('');
  if (!url.startsWith(prefix)) return null;
  const key = decodeURIComponent(url.slice(prefix.length).split(/[?#]/)[0]);
  return key && !key.split('/').includes('..') ? key : null;
}

/** Descarga un objeto del bucket entero a memoria. */
export async function getObjectBuffer(key: string) {
  const { Body } = await s3Client.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  if (!Body) throw new Error('El archivo no existe');
  return Buffer.from(await Body.transformToByteArray());
}

/**
 * Sube un objeto que nunca cambia (cada versión va a una key nueva), así CloudFront y el
 * navegador lo cachean para siempre.
 */
export async function putImmutableObject(key: string, body: Buffer, contentType: string) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
}

// Tope de keys por pedido de DeleteObjects.
const DELETE_BATCH = 1000;

/**
 * Borra objetos del bucket y falla si S3 no pudo borrar alguno. Con `Quiet` S3 responde 200
 * aunque no tenga permiso: los fallos vienen en `Errors`, uno por key.
 */
export async function deleteObjects(keys: string[]) {
  for (let i = 0; i < keys.length; i += DELETE_BATCH) {
    const batch = keys.slice(i, i + DELETE_BATCH);
    const { Errors } = await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: S3_BUCKET,
        Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
      }),
    );
    if (Errors?.length) {
      const failed = Errors.map(({ Key, Code }) => `${Key} (${Code})`).join(', ');
      throw new Error(`No se pudieron borrar de S3: ${failed}`);
    }
  }
}

/**
 * Para limpiezas que no deben frenar lo que hizo el usuario (el original ya optimizado, la foto
 * reemplazada): si falla, queda en el log del server con las keys, para borrarlas a mano.
 */
export async function deleteObjectsOrLog(keys: string[]) {
  try {
    await deleteObjects(keys);
  } catch (error) {
    console.error('s3: no se pudieron limpiar objetos', error);
  }
}

/**
 * Formulario firmado (POST) para subir un archivo grande directo a S3 desde el navegador. A
 * diferencia del PUT firmado, S3 rechaza el archivo si pesa más de `maxBytes`.
 */
export async function getPresignedPost(key: string, contentType: string, maxBytes: number) {
  return createPresignedPost(s3Client, {
    Bucket: S3_BUCKET,
    Key: key,
    Conditions: [
      ['content-length-range', 1, maxBytes],
      ['eq', '$Content-Type', contentType],
    ],
    Fields: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000, immutable' },
    Expires: 15 * 60,
  });
}

/** Tamaño y tipo de un objeto del bucket, o null si no existe. */
export async function headObject(key: string) {
  try {
    const head = await s3Client.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    return { size: head.ContentLength ?? 0, contentType: head.ContentType ?? null };
  } catch {
    return null;
  }
}

/** URL firmada de S3 que descarga el objeto como adjunto con `fileName`. Vence en 5 minutos. */
export async function getPresignedDownloadUrl(key: string, fileName: string) {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${fileName.replace(/"/g, '')}"`,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 300 });
}

export { s3Client, S3_BUCKET, CLOUDFRONT_URL };
