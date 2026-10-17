import type { ModelName } from '@/lib/prisma-models';
import { publish } from '@/lib/realtime';

// Which writes open pages hear about. The Prisma client calls `signalWrite` after every write
// (src/lib/prisma.ts), so actions don't publish by hand, like they don't expire caches by hand.

const CREATES = new Set(['create', 'createMany', 'createManyAndReturn', 'upsert']);
/** Bursts (a batch of photos) go out as one message after this long. */
const DEBOUNCE_MS = 1_500;

type Row = Record<string, unknown> | null | undefined;
type Announcement = { kind: string; title: string; href: string };

const text = (value: unknown) => (typeof value === 'string' ? value : '');
const clip = (value: string, max = 80) =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;

/** What a new row means for the feed, if anything. */
const announce: Partial<Record<ModelName, (_row: Row) => Announcement | null>> = {
  Event: (row) =>
    row?.id ? { kind: 'evento', title: text(row.name), href: `/eventos/${row.id}` } : null,
  Talk: (row) => ({ kind: 'charla', title: text(row?.title) || 'Nueva charla', href: '/charlas' }),
  GalleryItem: () => ({ kind: 'fotos', title: 'Nuevas fotos en la galería', href: '/galeria' }),
  Setup: (row) =>
    row?.id ? { kind: 'setup', title: text(row.title), href: `/setups/${row.id}` } : null,
  Project: (row) =>
    row?.id
      ? {
          kind: 'proyecto',
          title: text(row.title) || 'Nuevo proyecto',
          href: `/proyectos/${row.id}`,
        }
      : null,
  ForumPost: (row) =>
    row?.id ? { kind: 'foro', title: text(row.title), href: `/foro/tema/${row.id}` } : null,
  Advice: (row) =>
    row?.id
      ? { kind: 'consejo', title: clip(text(row.content)), href: `/consejos/${row.id}` }
      : null,
};

/** Writes that change how many places an event has left. */
const EVENT_SCOPED = new Set<ModelName>(['EventRegistration', 'EventWaitlistEntry']);

const pending = new Map<
  string,
  { timer: ReturnType<typeof setTimeout>; data?: Record<string, unknown> }
>();

const schedule = (topic: string, data?: Record<string, unknown>) => {
  const current = pending.get(topic);
  if (current) clearTimeout(current.timer);
  const timer = setTimeout(() => {
    const message = pending.get(topic);
    pending.delete(topic);
    void publish(topic, message?.data);
  }, DEBOUNCE_MS);
  // A pending message never keeps a script (the seed, a test) alive.
  timer.unref?.();
  pending.set(topic, { timer, data: data ?? current?.data });
};

export const signalWrite = (model: ModelName, operation: string, result: unknown) => {
  const row = (Array.isArray(result) ? result[0] : result) as Row;
  const toFeed = announce[model];
  if (toFeed && CREATES.has(operation) && !(model === 'Event' && row?.deletedAt)) {
    const announcement = toFeed(row);
    if (announcement?.title) schedule('feed', announcement);
  }
  if (EVENT_SCOPED.has(model) && typeof row?.eventId === 'string') {
    schedule(`event:${row.eventId}`);
  }
  if (model === 'Event' && typeof row?.id === 'string' && !CREATES.has(operation)) {
    schedule(`event:${row.id}`);
  }
};
