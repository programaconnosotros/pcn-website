import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuración del cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
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
  folder: string = 'events'
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const extension = fileName.split('.').pop() || 'jpg';
  const uniqueFileName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: uniqueFileName,
    ContentType: contentType,
  });

  // URL válida por 5 minutos
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  // URL final del archivo (CloudFront o S3)
  const fileUrl = CLOUDFRONT_URL
    ? `${CLOUDFRONT_URL}/${uniqueFileName}`
    : `https://${S3_BUCKET}.s3.amazonaws.com/${uniqueFileName}`;

  return { uploadUrl, fileUrl };
}

export { s3Client, S3_BUCKET, CLOUDFRONT_URL };

