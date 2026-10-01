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

/** URL pública de un objeto del bucket: por CloudFront si está configurado, o directo a S3. */
export function publicFileUrl(key: string) {
  return CLOUDFRONT_URL
    ? `${CLOUDFRONT_URL}/${key}`
    : `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
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

export async function deleteObjects(keys: string[]) {
  if (keys.length === 0) return;
  await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: S3_BUCKET,
      Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
    }),
  );
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
