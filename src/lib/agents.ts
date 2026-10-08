import sharp from 'sharp';
import { getObjectBuffer, keyFromPublicUrl } from '@/lib/s3';

// Lo que comparten los agentes de IA del sitio (charla desde su foto, evento desde sus flyers).

/** Modelo de los agentes, por Vercel AI Gateway (AI_GATEWAY_API_KEY). */
export const AGENT_MODEL = 'anthropic/claude-sonnet-5.5';

/** Sin la key del gateway los agentes no corren: las actions lo avisan en vez de fallar. */
export const MISSING_AGENT_KEY =
  'Falta configurar AI_GATEWAY_API_KEY en el servidor para usar el agente';

// Lado más largo de las imágenes que ve el modelo: más grande no le suma y cuesta más tokens.
const MAX_IMAGE_SIDE = 1568;

/** La imagen achicada a JPEG, derecha según su EXIF, para mandársela al modelo. */
export const imageForModel = (buffer: Buffer) =>
  sharp(buffer)
    .rotate()
    .resize(MAX_IMAGE_SIDE, MAX_IMAGE_SIDE, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

/**
 * Las imágenes del bucket (por su URL pública) listas para el modelo, en base64. Las URLs de otro
 * lado se saltean: el servidor no descarga nada que no sea nuestro.
 */
export const bucketImagesForModel = async (urls: string[], max = 4) => {
  const keys = urls
    .map(keyFromPublicUrl)
    .filter((key): key is string => !!key)
    .slice(0, max);
  return Promise.all(
    keys.map(async (key) => (await imageForModel(await getObjectBuffer(key))).toString('base64')),
  );
};
