'use server';

import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import { enforceRateLimit } from '@/lib/rate-limit';
import { keyFromPublicUrl } from '@/lib/s3';
import { isGoogleMapsUrl } from '@/lib/google-maps';
import { partners } from '@/data/partners';
import { MISSING_AGENT_KEY, bucketImagesForModel } from '@/lib/agents';
import { eventFlyerAgent, type EventDraft } from '@/lib/event-flyer-agent';

// La carpeta donde el form de eventos sube los flyers: el agente no lee nada fuera de ella.
const FLYERS_FOLDER = 'events/flyers/';

/** Lo que el agente pudo leer, con la forma de los campos del form de eventos. */
export type EventFlyerValues = {
  name?: string;
  description?: string;
  date?: string;
  endDate?: string;
  isOnline?: boolean;
  city?: string;
  placeName?: string;
  address?: string;
  googleMapsUrl?: string;
  streamingUrl?: string;
  externalRegistrationUrl?: string;
  capacity?: string;
  sponsors?: { name: string; website: string; logo: string }[];
};

export type FillEventFromFlyersResult =
  { status: 'ok'; values: EventFlyerValues; notes: string } | { status: 'failed'; reason: string };

const inputSchema = z.array(z.string().max(2048)).min(1).max(10);

const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const isHttpsUrl = (value: string) => /^https:\/\/\S+$/.test(value);

const text = (value: string | null, max: number) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
};

const url = (value: string | null) => {
  const trimmed = value?.trim();
  return trimmed && isHttpsUrl(trimmed) && trimmed.length <= 2048 ? trimmed : undefined;
};

const dateTime = (value: string | null) =>
  value && LOCAL_DATE_TIME.test(value) && !Number.isNaN(new Date(value).getTime())
    ? value
    : undefined;

/**
 * Lo que devolvió el modelo, sin nada que el form no aceptaría: largos y formatos del
 * eventSchema, y logos de sponsors solo si son los de un partner del sitio.
 */
const toFormValues = (draft: EventDraft): EventFlyerValues => {
  const date = dateTime(draft.date);
  const endDate = dateTime(draft.endDate);
  const googleMapsUrl = url(draft.googleMapsUrl);
  const description = text(draft.description, 2000);

  const values: EventFlyerValues = {
    name: text(draft.name, 200),
    description: description && description.length >= 10 ? description : undefined,
    date,
    endDate: date && endDate && endDate > date ? endDate : undefined,
    isOnline: draft.isOnline ?? undefined,
    city: text(draft.city, 100),
    placeName: text(draft.placeName, 100),
    address: text(draft.address, 200),
    googleMapsUrl: googleMapsUrl && isGoogleMapsUrl(googleMapsUrl) ? googleMapsUrl : undefined,
    streamingUrl: url(draft.streamingUrl),
    externalRegistrationUrl: url(draft.externalRegistrationUrl),
    capacity: draft.capacity && draft.capacity > 0 ? String(draft.capacity) : undefined,
    sponsors: draft.sponsors.flatMap((sponsor) => {
      const name = text(sponsor.name, 200);
      if (!name) return [];
      const partner = partners.find((p) => p.name.toLowerCase() === name.toLowerCase());
      if (partner) return [{ name: partner.name, website: partner.url, logo: partner.logo }];
      return [{ name, website: url(sponsor.website) ?? '', logo: '' }];
    }),
  };

  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0),
    ),
  ) as EventFlyerValues;
};

/** Lee los flyers de un evento y devuelve los datos para completar su form. No guarda nada. */
export const fillEventFromFlyers = async (
  flyerUrls: string[],
): Promise<FillEventFromFlyersResult> => {
  await requireAdmin();

  const parsed = inputSchema.safeParse(flyerUrls);
  const keys = parsed.success ? parsed.data.map(keyFromPublicUrl) : [];
  if (!keys.length || keys.some((key) => !key?.startsWith(FLYERS_FOLDER))) {
    return { status: 'failed', reason: 'Subí los flyers desde este formulario' };
  }

  await enforceRateLimit('aiAgent');

  if (!process.env.AI_GATEWAY_API_KEY) return { status: 'failed', reason: MISSING_AGENT_KEY };

  try {
    const images = await bucketImagesForModel(parsed.data!);
    const { output } = await eventFlyerAgent.generate({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Hoy es ${new Date().toISOString().slice(0, 10)}. Estos son los flyers del evento.`,
            },
            ...images.map((data) => ({
              type: 'file' as const,
              mediaType: 'image/jpeg',
              data,
            })),
          ],
        },
      ],
      timeout: 2 * 60 * 1000,
    });

    const values = toFormValues(output);
    if (!Object.keys(values).length) {
      return { status: 'failed', reason: output.notes || 'No se pudo leer nada de los flyers' };
    }
    return { status: 'ok', values, notes: output.notes };
  } catch (error) {
    console.error('[event-flyer-agent]', error);
    return { status: 'failed', reason: 'El agente no pudo leer los flyers. Probá de nuevo.' };
  }
};
