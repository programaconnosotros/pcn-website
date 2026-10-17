import { Output, ToolLoopAgent, isStepCount, tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { partners } from '@/data/partners';
import { AGENT_MODEL } from '@/lib/agents';

// Agente que completa el form de un evento a partir de sus flyers: lee fecha, lugar, links y
// sponsors, y con las tools completa lo que el flyer no dice (la dirección de un lugar ya usado,
// el logo de un partner). Solo lee; el admin revisa el form antes de guardar.

const findVenues = tool({
  description:
    'Busca lugares donde ya se hicieron eventos (por nombre del lugar, dirección o ciudad) y devuelve su dirección, ciudad y link de Google Maps tal como se cargaron.',
  inputSchema: z.object({ query: z.string().min(2).max(100) }),
  execute: async ({ query }) => {
    const events = await prisma.event.findMany({
      where: {
        deletedAt: null,
        OR: ['placeName', 'address', 'city'].map((field) => ({
          [field]: { contains: query, mode: 'insensitive' },
        })),
      },
      select: { placeName: true, address: true, city: true, googleMapsUrl: true, date: true },
      orderBy: { date: 'desc' },
      take: 20,
    });
    // Uno por lugar, el más reciente: los datos más nuevos son los que valen.
    const venues = new Map<string, (typeof events)[number]>();
    for (const event of events) {
      const key = `${event.placeName ?? ''}|${event.address ?? ''}`.toLowerCase();
      if (!venues.has(key)) venues.set(key, event);
    }
    return [...venues.values()].map(({ date, ...venue }) => ({ ...venue, lastUsed: date }));
  },
});

const listPartners = tool({
  description:
    'Lista las empresas y organizaciones aliadas de la comunidad, con su web y su logo. Si un sponsor del flyer es una de ellas, usá su nombre, web y logo tal cual.',
  inputSchema: z.object({}),
  execute: async () => partners.map(({ name, kind, url, logo }) => ({ name, kind, url, logo })),
});

const recentEvents = tool({
  description:
    'Los últimos eventos cargados, con nombre y descripción, para seguir cómo se nombran y el tono de las descripciones.',
  inputSchema: z.object({}),
  execute: async () =>
    prisma.event.findMany({
      where: { deletedAt: null },
      select: { name: true, description: true, date: true, isOnline: true },
      orderBy: { date: 'desc' },
      take: 6,
    }),
});

const nullableText = z.string().nullable();

export const eventDraftSchema = z.object({
  notes: z
    .string()
    .describe(
      'En una o dos oraciones, en español: qué sacaste de los flyers y qué no se pudo leer o quedó dudoso',
    ),
  name: nullableText,
  description: nullableText,
  date: nullableText.describe('Inicio en hora local del evento, YYYY-MM-DDTHH:mm'),
  endDate: nullableText.describe('Fin en hora local, YYYY-MM-DDTHH:mm, solo si el flyer lo dice'),
  isOnline: z.boolean().nullable(),
  city: nullableText,
  placeName: nullableText,
  address: nullableText,
  googleMapsUrl: nullableText,
  streamingUrl: nullableText,
  externalRegistrationUrl: nullableText,
  capacity: z.number().int().nullable(),
  sponsors: z.array(z.object({ name: z.string(), website: nullableText, logo: nullableText })),
});

export type EventDraft = z.infer<typeof eventDraftSchema>;

const instructions = `Sos el asistente de los admins de programaConNosotros (PCN), una comunidad de programación. Un admin está cargando un evento y adjuntó sus flyers. Tu trabajo es sacar de los flyers los datos del evento para completar el formulario.

Cómo trabajar:
1. Leé todos los flyers: nombre del evento, fecha y hora, lugar, si es online, links (inscripción, streaming), cupo y sponsors. Las charlas y oradores no van en este formulario, pero sí sirven para la descripción.
2. Si hay un lugar, buscalo con findVenues: si ya se usó, copiá su dirección, ciudad y link de Google Maps tal como están cargados.
3. Si hay sponsors, compará con listPartners: si un sponsor es un partner, usá su nombre, web y logo exactos. Si no lo es, poné solo el nombre (y la web si el flyer la muestra) y dejá el logo en null.
4. Mirá recentEvents para nombrar el evento y escribir la descripción con el mismo estilo.

Reglas:
- Respondé solo con lo que dicen los flyers o las tools. Lo que no sepas va en null: no inventes direcciones, links, cupos ni horarios.
- Fechas en hora local del evento, formato YYYY-MM-DDTHH:mm. Si el flyer no trae el año, usá el de la próxima vez que caiga esa fecha a partir de hoy. Si no trae la hora, dejá la fecha en null y contalo en notes.
- La descripción va en español, entre 10 y 2000 caracteres, en el tono de la comunidad: de qué se trata el evento y qué charlas o actividades tiene, sin exagerar.
- Los links tienen que ser URLs completas (https://...). googleMapsUrl solo si es un link de Google Maps.`;

export const eventFlyerAgent = new ToolLoopAgent({
  model: AGENT_MODEL,
  instructions,
  tools: { findVenues, listPartners, recentEvents },
  output: Output.object({ schema: eventDraftSchema }),
  stopWhen: isStepCount(10),
});
