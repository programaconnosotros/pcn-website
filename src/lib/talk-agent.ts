import { Output, ToolLoopAgent, isStepCount, tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AGENT_MODEL, bucketImagesForModel } from '@/lib/agents';
import { searchPeople } from '@/lib/people-search';

// Agente que arma una charla a partir de su foto: busca el evento, la propuesta y los oradores en
// la base y devuelve los datos para crearla. Sus tools solo leen; quien crea la charla es la
// action (createTalkFromPhoto), después de validar lo que devolvió.

const DAY_MS = 24 * 60 * 60 * 1000;

const eventSummary = {
  id: true,
  name: true,
  date: true,
  endDate: true,
  placeName: true,
  city: true,
  isOnline: true,
  flyerImages: true,
  _count: { select: { talks: true, talkProposals: true } },
} as const;

const speakerFields = {
  userId: true,
  speakerName: true,
  isProfessional: true,
  jobTitle: true,
  enterprise: true,
  isStudent: true,
  career: true,
  studyPlace: true,
} as const;

const toEventRow = ({ flyerImages, _count, ...event }: EventRow) => ({
  ...event,
  flyers: flyerImages.length,
  talks: _count.talks,
  proposals: _count.talkProposals,
});

type EventRow = Awaited<ReturnType<typeof findEventRows>>[number];

const findEventRows = (where: object) =>
  prisma.event.findMany({
    where: { deletedAt: null, ...where },
    select: eventSummary,
    orderBy: { date: 'desc' },
    take: 15,
  });

const findEvents = tool({
  description:
    'Busca eventos de la comunidad. Con `around` trae los de esa fecha ±3 días; con `query`, los que tienen ese texto en el nombre o el lugar; sin nada, los 15 más recientes que ya pasaron.',
  inputSchema: z.object({
    around: z.string().date().optional().describe('Fecha YYYY-MM-DD'),
    query: z.string().max(100).optional(),
  }),
  execute: async ({ around, query }) => {
    const where: Record<string, unknown> = {};
    if (around) {
      const day = new Date(`${around}T12:00:00.000Z`).getTime();
      where.date = { gte: new Date(day - 3 * DAY_MS), lte: new Date(day + 3 * DAY_MS) };
    }
    if (query) {
      where.OR = ['name', 'placeName', 'city', 'description'].map((field) => ({
        [field]: { contains: query, mode: 'insensitive' },
      }));
    }
    if (!around && !query) where.date = { lte: new Date() };
    return (await findEventRows(where)).map(toEventRow);
  },
});

const getEventDetails = tool({
  description:
    'Detalle de un evento: descripción, propuestas de charla (con sus oradores) y las charlas ya cargadas, para no duplicarlas.',
  inputSchema: z.object({ eventId: z.string() }),
  execute: async ({ eventId }) => {
    const event = await prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
      select: {
        ...eventSummary,
        description: true,
        talkProposals: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            talk: { select: { id: true } },
            speakers: { select: speakerFields, orderBy: { order: 'asc' } },
          },
        },
        talks: {
          select: {
            id: true,
            title: true,
            speakers: { select: { speakerName: true }, orderBy: { order: 'asc' } },
          },
        },
      },
    });
    if (!event) return { error: 'No existe ese evento' };

    const { talkProposals, talks, ...rest } = event;
    return {
      ...toEventRow(rest),
      description: rest.description,
      proposals: talkProposals.map(({ talk, ...proposal }) => ({
        ...proposal,
        alreadyHasTalk: !!talk,
      })),
      existingTalks: talks.map((talk) => ({
        id: talk.id,
        title: talk.title,
        speakers: talk.speakers.map((s) => s.speakerName),
      })),
    };
  },
});

const viewEventFlyers = tool({
  description:
    'Muestra los flyers de un evento. Suelen tener el título de cada charla y la cara y el nombre de cada orador, así que sirven para reconocer a quien aparece en la foto.',
  inputSchema: z.object({ eventId: z.string() }),
  execute: async ({ eventId }) => {
    const event = await prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
      select: { flyerImages: true },
    });
    const images = await bucketImagesForModel(event?.flyerImages ?? []);
    return { images };
  },
  toModelOutput: ({ output }) => ({
    type: 'content',
    value: output.images.length
      ? output.images.map((data) => ({
          type: 'file' as const,
          mediaType: 'image/jpeg',
          data: { type: 'data' as const, data },
        }))
      : [{ type: 'text' as const, text: 'El evento no tiene flyers.' }],
  }),
});

const searchUsers = tool({
  description:
    'Busca usuarios registrados por nombre, trabajo o estudio, para vincular a cada orador con su perfil y completar su rol, empresa, carrera o universidad.',
  inputSchema: z.object({ query: z.string().min(2).max(100) }),
  execute: async ({ query }) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        slogan: true,
        jobTitle: true,
        enterprise: true,
        career: true,
        studyPlace: true,
        positions: { select: { jobTitle: true, enterprise: true } },
      },
    });
    return searchPeople(users, query, {
      name: (user) => user.name,
      fields: (user) => [
        user.name,
        user.slogan,
        user.jobTitle,
        user.enterprise,
        user.career,
        user.studyPlace,
        ...user.positions.flatMap((position) => [position.jobTitle, position.enterprise]),
      ],
      limit: 8,
    });
  },
});

const nullableText = z.string().nullable();

export const talkDraftSchema = z.object({
  found: z
    .boolean()
    .describe('true solo si identificaste el evento y la charla con confianza razonable'),
  reason: z
    .string()
    .describe(
      'En una o dos oraciones, en español: cómo identificaste la charla o, si no pudiste, qué faltó',
    ),
  eventId: nullableText,
  proposalId: nullableText.describe('La propuesta de la que sale la charla, si hay una'),
  title: z.string(),
  description: z.string(),
  speakers: z.array(
    z.object({
      userId: nullableText,
      speakerName: z.string(),
      isProfessional: z.boolean(),
      jobTitle: nullableText,
      enterprise: nullableText,
      isStudent: z.boolean(),
      career: nullableText,
      studyPlace: nullableText,
    }),
  ),
});

export type TalkDraft = z.infer<typeof talkDraftSchema>;

const instructions = `Sos el asistente de los admins de programaConNosotros (PCN), una comunidad de programación. Un admin subió la foto de una charla dada en un evento de la comunidad y tu trabajo es identificar esa charla y devolver sus datos para cargarla en /charlas. El admin no te va a dar nada más que la foto: todo lo demás lo sacás de la base con las tools.

Cómo trabajar:
1. Mirá la foto: el texto de las slides o la pantalla, el lugar, la cantidad de oradores y cómo se ven.
2. Encontrá el evento con findEvents. Si te paso la fecha en que se sacó la foto, empezá por esa fecha; si no, buscá entre los eventos recientes o por lo que se lea en la foto.
3. Abrí los candidatos con getEventDetails. Las propuestas aceptadas (ACCEPTED) son las charlas que se dieron; las demás pueden servir si coinciden con la foto. Si el evento tiene varias charlas, usá viewEventFlyers para comparar a la persona de la foto con las caras y los títulos de los flyers.
4. Si la charla sale de una propuesta, usá su título, descripción y oradores, y pasá su proposalId. No elijas una propuesta con alreadyHasTalk ni una charla que ya esté en existingTalks: en ese caso respondé found=false explicando que ya está cargada.
5. Para cada orador sin userId, buscalo con searchUsers y, si es claramente la misma persona, usá su userId y sus datos.

Datos de cada orador: tiene que ser profesional (con rol y empresa), estudiante (con carrera y universidad) o las dos cosas. Completalos con lo que diga la propuesta o el perfil; no inventes empresas, roles ni carreras. Si falta un dato, dejalo en null.

La descripción tiene entre 10 y 2000 caracteres, en español y en el tono de la comunidad: qué se contó en la charla, sin exagerar. Si la propuesta tiene descripción, usala tal cual o apenas corregida.

Si no podés identificar el evento o la charla con confianza razonable, respondé found=false y explicá en reason qué viste y qué faltó. Es preferible no cargar nada a cargar una charla equivocada.`;

export const talkAgent = new ToolLoopAgent({
  model: AGENT_MODEL,
  instructions,
  tools: { findEvents, getEventDetails, viewEventFlyers, searchUsers },
  output: Output.object({ schema: talkDraftSchema }),
  stopWhen: isStepCount(15),
});
